import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MODEL_RULES } from "@/lib/modelRules";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    if (!data || !Array.isArray(data)) return NextResponse.json({ error: "Formato inválido" }, { status: 400 });

    const lotesParaProcesar = new Map();
    data.forEach(row => {
      const key = `${row.WO}-${row.Lote}`;
      if (!lotesParaProcesar.has(key)) lotesParaProcesar.set(key, { ...row });
    });

    // 1. Pre-carga masiva (Única consulta de lectura)
    const rackNames = Array.from(new Set(data.map(r => normalizeRackName(r.Rack))));
    const allRacks = await prisma.rack.findMany({ where: { nombre: { in: rackNames } } });
    const rackMap = new Map(allRacks.map(r => [r.nombre, r]));
    
    const allLocations = await (prisma as any).ubicacion.findMany({
      where: { rackId: { in: allRacks.map(r => r.id) }, estibaId: null },
      orderBy: [{ rackId: 'asc' }, { columna: 'asc' }, { nivel: 'asc' }, { profundidad: 'desc' }]
    });

    const locsByRack: Record<number, any[]> = {};
    allLocations.forEach((l: any) => {
      if (!locsByRack[l.rackId]) locsByRack[l.rackId] = [];
      locsByRack[l.rackId].push(l);
    });

    const estibasToCreate: any[] = [];
    const errores: string[] = [];

    // 2. Asignación inteligente en memoria
    for (const [key, row] of lotesParaProcesar) {
      const rack = rackMap.get(normalizeRackName(row.Rack));
      if (!rack) { errores.push(`Rack ${row.Rack} no existe.`); continue; }

      const available = locsByRack[rack.id] || [];
      const targets = calculateEstibas(row.Modelo, row.Tipo);

      let estibaCounter = 1;
      for (const tipo of targets) {
        let idx = -1;
        if (row.Columna && row.Nivel && row.Profundidad) {
          idx = available.findIndex(l => l.columna === parseInt(row.Columna) && l.nivel === parseInt(row.Nivel) && l.profundidad === parseInt(row.Profundidad));
        }

        if (idx === -1) {
          const isHeavy = tipo.includes("MOTOR") || tipo.includes("TORNILLERIA") || tipo.includes("TORNILERIA");
          idx = available.findIndex(l => isHeavy ? l.nivel === 1 : l.nivel > 1);
          if (idx === -1) idx = 0;
        }

        const spot = available[idx];
        if (!spot) { errores.push(`Espacio insuficiente en ${rack.nombre} para ${tipo} de ${key}`); break; }

        estibasToCreate.push({
          code: `AUTO-${row.WO}-${row.Lote}-${tipo.substring(0,3)}-${estibaCounter++}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          tipo, wo: String(row.WO), loteNum: String(row.Lote),
          modelo: String(row.Modelo || "").trim().toUpperCase(),
          fProd: row.Fecha_Produccion ? new Date(row.Fecha_Produccion) : new Date(),
          fInt: row.Fecha_Intervencion ? new Date(row.Fecha_Intervencion) : new Date(),
          locId: spot.id
        });
        available.splice(idx, 1);
      }
    }

    // 3. Escritura Atómica con SQL Nativo (Velocidad Máxima)
    if (estibasToCreate.length > 0) {
      await prisma.$transaction(async (tx: any) => {
        const distinctLotes = Array.from(new Set(estibasToCreate.map(e => `${e.wo}-${e.loteNum}`)));
        const loteIdMap: Record<string, string> = {};

        for (const lKey of distinctLotes) {
          const s = estibasToCreate.find(e => `${e.wo}-${e.loteNum}` === lKey);
          const l = await tx.lote.upsert({
            where: { wo_numeroLote: { wo: s.wo, numeroLote: s.loteNum } },
            update: { modelo: s.modelo },
            create: { wo: s.wo, numeroLote: s.loteNum, modelo: s.modelo, fechaProduccion: s.fProd, fechaIntervencion: s.fInt }
          });
          loteIdMap[lKey] = l.id;
        }

        const created = await tx.estiba.createManyAndReturn({
          data: estibasToCreate.map(e => ({
            codigoBarras: e.code, tipo: e.tipo, status: "STORED",
            loteId: loteIdMap[`${e.wo}-${e.loteNum}`]
          }))
        });

        // OPTIMIZACIÓN CRÍTICA: Bulk update de ubicaciones vía RAW SQL (Corregido a INT)
        const values = created.map((e: any, i: number) => `(${estibasToCreate[i].locId}, ${e.id})`).join(',');
        await tx.$executeRawUnsafe(`
          UPDATE "Ubicacion" AS u
          SET "estibaId" = v.estiba_id
          FROM (VALUES ${values}) AS v(loc_id, estiba_id)
          WHERE u.id = v.loc_id
        `);
      }, { timeout: 30000 });
    }

    return NextResponse.json({ success: true, message: `${estibasToCreate.length} estibas procesadas en tiempo récord.`, errores: errores.length > 0 ? errores : null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function normalizeRackName(n: string) {
  let s = String(n || "").trim().toUpperCase();
  return s.match(/^[A-Z]-[0-9]$/) ? `${s.split("-")[0]}-0${s.split("-")[1]}` : s;
}

function calculateEstibas(m: string, t: string) {
  const c = (s: string) => s.replace(/\s+/g, "").toUpperCase();
  const input = c(m);
  const ruleKey = Object.keys(MODEL_RULES).find(k => c(k).includes(input) || input.includes(c(k)));
  const rule = ruleKey ? MODEL_RULES[ruleKey] : null;
  const res: string[] = [];
  if (rule) {
    Object.entries(rule).forEach(([tipo, count]) => {
      if (tipo !== 'TOTAL') for (let i = 0; i < (count as number); i++) res.push(tipo);
    });
  } else res.push(t?.trim() || "GENERAL");
  return res;
}
