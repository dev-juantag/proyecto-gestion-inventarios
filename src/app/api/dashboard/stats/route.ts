import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Métricas Globales
    const totalUbicaciones = await (prisma as any).ubicacion.count({
      where: { rack: { isActive: true } }
    });
    
    const ocupadas = await (prisma as any).ubicacion.count({
      where: { rack: { isActive: true }, estibaId: { not: null } }
    });

    const totalEstibas = await prisma.estiba.count({
      where: { status: "STORED" }
    });

    const porcentajeGlobal = totalUbicaciones > 0 ? ((ocupadas / totalUbicaciones) * 100).toFixed(1) : "0.0";

    // 2. Traer Racks y sus Ubicaciones
    const racksData = await (prisma as any).rack.findMany({
      where: { isActive: true },
      include: {
        ubicaciones: {
          orderBy: [
            { columna: 'asc' },
            { nivel: 'asc' },
            { profundidad: 'asc' }
          ],
          include: { estiba: { include: { lote: true } } }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    // Procesar agrupamiento por Rack y "Canal" (Columna + Nivel)
    const alertas: any[] = [];
    
    const racks = racksData.map((rack: any) => {
      let rackOcupadas = 0;
      const canalesMap = new Map();

      rack.ubicaciones.forEach((u: any) => {
        const canalKey = `C${u.columna}-N${u.nivel}`;
        if (!canalesMap.has(canalKey)) {
          canalesMap.set(canalKey, {
            id: canalKey,
            nivel: u.nivel,
            columna: u.columna,
            maxCapacidad: rack.profundidad,
            ocupadas: 0,
            ubicaciones: []
          });
        }
        
        const c = canalesMap.get(canalKey);
        if (u.estibaId) {
          c.ocupadas++;
          rackOcupadas++;
        }

        c.ubicaciones.push({
          id: u.id,
          profundidad: u.profundidad,
          vacio: u.estibaId === null,
          estiba: u.estiba?.codigoBarras || null,
          tipo: u.estiba?.tipo || null,
          lote: u.estiba?.lote?.numeroLote || null,
          paquete: u.estiba?.lote?.wo || null, // Reuse package field for WO to keep UI intact
          modelo: u.estiba?.lote?.modelo || null,
          vence: u.estiba?.lote?.fechaProduccion || null,
          intervencion: u.estiba?.lote?.fechaIntervencion || null
        });
      });

      // Alerta por Rack completo
      const totalRackCapacidad = rack.columnas * rack.niveles * rack.profundidad;
      const rackOcupacionPct = (rackOcupadas / totalRackCapacidad) * 100;
      
      if (rackOcupacionPct >= 90) {
        alertas.push({
          type: 'CRITICAL',
          message: `Rack ${rack.nombre} al ${rackOcupacionPct.toFixed(0)}% de capacidad total.`,
          time: 'Justo ahora'
        });
      }

      return {
        rack: rack.nombre,
        totalUbicaciones: rack.columnas * rack.niveles * rack.profundidad,
        ocupadas: rackOcupadas,
        canales: Array.from(canalesMap.values())
      };
    });

    return NextResponse.json({
      success: true,
      global: {
        totalUbicaciones,
        ocupadas,
        porcentajeGlobal,
        totalEstibas,
        totalPaquetes: 0 // Removed in schema but kept for UI compat
      },
      racks: racks,
      alertas: alertas.slice(0, 5) // TOP 5 alertas
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
