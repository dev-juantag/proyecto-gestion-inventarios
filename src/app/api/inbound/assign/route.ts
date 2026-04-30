import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wo, numeroLote, modelo, fechaIntervencion, fechaProduccion, composicion } = body;

    if (!wo || !numeroLote || !fechaIntervencion || !fechaProduccion || !composicion) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const tiposAcrear: string[] = [];
    Object.entries(composicion).forEach(([tipo, cant]) => {
      for (let i = 0; i < (Number(cant) || 0); i++) tiposAcrear.push(tipo);
    });

    const totalNecesario = tiposAcrear.length;

    // Función de ejecución con reintentos para manejar micro-cortes de Supabase
    async function executeWithRetry(retries = 3, delay = 500): Promise<any> {
      try {
        // 1. Verificación rápida
        const exists = await (prisma as any).lote.findUnique({ where: { wo_numeroLote: { wo, numeroLote } } });
        if (exists) throw new Error(`El lote ${numeroLote} de la WO ${wo} ya existe.`);

        // 2. Pre-carga de racks con el orden correcto: Profundidad Fondo (10) -> Frente (1), Nivel Alto (7) -> Bajo (1)
        const racksRaw = await (prisma as any).rack.findMany({
          where: { isActive: true },
          include: {
            ubicaciones: {
              where: { estibaId: null },
              orderBy: [{ columna: 'asc' }, { profundidad: 'desc' }, { nivel: 'desc' }]
            }
          }
        });

        const racksSorted = racksRaw.sort((a: any, b: any) => b.ubicaciones.length - a.ubicaciones.length);
        let rackTarget = racksSorted.find((r: any) => r.ubicaciones.length >= totalNecesario);
        const racksToUse = rackTarget ? [rackTarget] : racksSorted;

        const slotsAsignados: any[] = [];
        const isHeavy = (t: string) => {
          const ut = t.toUpperCase();
          return ut.includes("MOTOR") || ut.includes("TORNILLERIA") || ut.includes("TORNILERIA");
        };

        let pesados = tiposAcrear.filter(t => isHeavy(t));
        let livianos = tiposAcrear.filter(t => !isHeavy(t));

        for (const rack of racksToUse) {
          if (pesados.length === 0 && livianos.length === 0) break;
          
          for (const ubi of rack.ubicaciones) {
            if (pesados.length === 0 && livianos.length === 0) break;

            let tipo = "";
            if (ubi.nivel > 1) {
              // REGLA ESTRICTA: En niveles superiores SOLO livianos. 
              // Si no hay livianos, dejamos el hueco vacío para la siguiente profundidad.
              if (livianos.length > 0) tipo = livianos.shift()!;
            } else {
              // Nivel 1: Prioridad Pesados, si no hay, usamos liviano.
              if (pesados.length > 0) tipo = pesados.shift()!;
              else if (livianos.length > 0) tipo = livianos.shift()!;
            }

            if (tipo) {
              slotsAsignados.push({ ubiId: ubi.id, rack: rack.nombre, c: ubi.columna, n: ubi.nivel, p: ubi.profundidad, tipo });
            }
          }
        }

        if (slotsAsignados.length < totalNecesario) throw new Error(`Capacidad insuficiente.`);

        // 4. Escritura Atómica
        return await prisma.$transaction(async (tx: any) => {
          const lote = await tx.lote.create({
            data: { wo, numeroLote, modelo: modelo || "NO ESPECIFICADO", cantidadEstibas: totalNecesario, fechaIntervencion: new Date(fechaIntervencion), fechaProduccion: new Date(fechaProduccion) }
          });

          const created = await tx.estiba.createManyAndReturn({
            data: slotsAsignados.map((s, i) => ({ 
              codigoBarras: `EST-${numeroLote}-${Date.now().toString().slice(-6)}-${i+1}-${Math.random().toString(36).slice(-3).toUpperCase()}`, 
              tipo: s.tipo, loteId: lote.id, status: "STORED" 
            }))
          });

          const values = created.map((e: any, i: number) => `(${slotsAsignados[i].ubiId}, ${e.id})`).join(',');
          await tx.$executeRawUnsafe(`UPDATE "Ubicacion" SET "estibaId" = v.e FROM (VALUES ${values}) AS v(l, e) WHERE id = v.l`);

          return {
            totalAsignadas: totalNecesario,
            loteInfo: `${wo} ${numeroLote}`,
            rackPrincipal: slotsAsignados[0].rack,
            ubicaciones: slotsAsignados.map((s, i) => ({ rack: s.rack, pos: `C${s.c}-N${s.n}-P${s.p}`, tipo: s.tipo, code: created[i].codigoBarras }))
          };
        }, { timeout: 30000 });

      } catch (error: any) {
        if (retries > 0 && (error.message.includes("Can't reach") || error.code === 'P1001' || error.code === 'P2010')) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    }

    const result = await executeWithRetry();
    return NextResponse.json({ success: true, recomendacion: result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
