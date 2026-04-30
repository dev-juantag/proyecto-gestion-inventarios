import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Función auxiliar para reintentar operaciones de base de datos
async function withRetry(fn: () => Promise<any>, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries) throw error;
      // Esperar un poco antes de reintentar (backoff simple)
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
}

export async function GET() {
  try {
    const stats = await withRetry(async () => {
      // Ejecutamos las consultas principales en paralelo para máxima velocidad
      const [totalUbicaciones, ocupadas, totalEstibas, totalLotes] = await Promise.all([
        (prisma as any).ubicacion.count({ where: { rack: { isActive: true } } }),
        (prisma as any).ubicacion.count({ where: { rack: { isActive: true }, estibaId: { not: null } } }),
        prisma.estiba.count({ where: { status: "STORED" } }),
        prisma.lote.count()
      ]);

      // Traer Racks y sus Ubicaciones
      const racksData = await (prisma as any).rack.findMany({
        where: { isActive: true },
        include: {
          ubicaciones: {
            orderBy: [{ columna: 'asc' }, { nivel: 'asc' }, { profundidad: 'asc' }],
            include: { estiba: { include: { lote: true } } }
          }
        },
        orderBy: { nombre: 'asc' }
      });

      return { totalUbicaciones, ocupadas, totalEstibas, totalLotes, racksData };
    });

    const { totalUbicaciones, ocupadas, totalEstibas, totalLotes, racksData } = stats;
    const porcentajeGlobal = totalUbicaciones > 0 ? ((ocupadas / totalUbicaciones) * 100).toFixed(1) : "0.0";

    const alertas: any[] = [];
    const racks = racksData.map((rack: any) => {
      let rackOcupadas = 0;
      const canalesMap = new Map();

      rack.ubicaciones.forEach((u: any) => {
        const canalKey = `C${u.columna}-N${u.nivel}`;
        if (!canalesMap.has(canalKey)) {
          canalesMap.set(canalKey, {
            id: canalKey, nivel: u.nivel, columna: u.columna,
            maxCapacidad: rack.profundidad, ocupadas: 0, ubicaciones: []
          });
        }
        
        const c = canalesMap.get(canalKey);
        if (u.estibaId) { c.ocupadas++; rackOcupadas++; }

        c.ubicaciones.push({
          id: u.id, profundidad: u.profundidad, vacio: u.estibaId === null,
          estiba: u.estiba?.codigoBarras || null, tipo: u.estiba?.tipo || null,
          lote: u.estiba?.lote?.numeroLote || null, paquete: u.estiba?.lote?.wo || null,
          modelo: u.estiba?.lote?.modelo || null, vence: u.estiba?.lote?.fechaProduccion || null
        });
      });

      const totalRackCapacidad = rack.columnas * rack.niveles * rack.profundidad;
      const rackOcupacionPct = (rackOcupadas / totalRackCapacidad) * 100;
      if (rackOcupacionPct >= 90) {
        alertas.push({ type: 'CRITICAL', message: `Rack ${rack.nombre} al ${rackOcupacionPct.toFixed(0)}% de capacidad.`, time: 'Ahora' });
      }

      return { rack: rack.nombre, totalUbicaciones: totalRackCapacidad, ocupadas: rackOcupadas, canales: Array.from(canalesMap.values()) };
    });

    return NextResponse.json({
      success: true,
      global: { totalUbicaciones, ocupadas, porcentajeGlobal, totalEstibas, totalLotes, totalPaquetes: 0 },
      racks,
      alertas: alertas.slice(0, 5)
    });

  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    // Si falla después de reintentos, devolvemos un 500 con detalle
    return NextResponse.json({ 
      error: "No se pudo conectar con la base de datos. Por favor refresca la página.", 
      detail: error.message 
    }, { status: 500 });
  }
}
