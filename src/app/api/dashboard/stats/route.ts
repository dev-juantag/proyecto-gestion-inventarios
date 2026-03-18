import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Métricas Globales
    const totalUbicaciones = await prisma.ubicacion.count({
      where: { canal: { isActive: true } }
    });
    
    const ocupadas = await prisma.ubicacion.count({
      where: { canal: { isActive: true }, estibaId: { not: null } }
    });

    const totalEstibas = await prisma.estiba.count({
      where: { status: "STORED" }
    });

    const totalPaquetes = await prisma.paquete.count();

    const porcentajeGlobal = totalUbicaciones > 0 ? ((ocupadas / totalUbicaciones) * 100).toFixed(1) : "0.0";

    // 2. Traer Racks y sus Canales con el detalle de ocupación
    // Para simplificar, agrupamos por Rack en memoria o traemos todo si no es inmenso
    const racksData = await prisma.canal.findMany({
      where: { isActive: true },
      include: {
        ubicaciones: {
          orderBy: { profundidad: 'asc' },
          include: { estiba: { include: { lote: true } } }
        }
      },
      orderBy: [
        { rack: 'asc' },
        { nivel: 'desc' }
      ]
    });

    // Procesar agrupamiento por Rack
    const racksMap = new Map();
    const alertas: any[] = [];

    racksData.forEach((canal: any) => {
      if (!racksMap.has(canal.rack)) {
        racksMap.set(canal.rack, {
          rack: canal.rack,
          totalUbicaciones: 0,
          ocupadas: 0,
          canales: []
        });
      }
      
      const r = racksMap.get(canal.rack);
      r.totalUbicaciones += canal.maxCapacidad;
      
      const ubicacionesOcupadas = canal.ubicaciones.filter((u: any) => u.estibaId !== null);
      r.ocupadas += ubicacionesOcupadas.length;

      const canalOcupacion = (ubicacionesOcupadas.length / canal.maxCapacidad) * 100;
      if (canalOcupacion >= 90) {
         alertas.push({
           type: 'CRITICAL',
           message: `Canal Rack ${canal.rack} (Col ${canal.columna}, Niv ${canal.nivel}) al ${canalOcupacion.toFixed(0)}% de capacidad.`,
           time: 'Justo ahora'
         });
      }

      r.canales.push({
        id: canal.id,
        nivel: canal.nivel,
        maxCapacidad: canal.maxCapacidad,
        ocupadas: ubicacionesOcupadas.length,
        ubicaciones: canal.ubicaciones.map((u: any) => ({
          id: u.id,
          profundidad: u.profundidad,
          vacio: u.estibaId === null,
          estiba: u.estiba?.codigoBarras || null,
          lote: u.estiba?.lote?.lotId || null,
          paquete: u.estiba?.lote?.paqueteId || null,
          vence: u.estiba?.lote?.productionDate || null
        }))
      });
    });

    const racks = Array.from(racksMap.values());

    return NextResponse.json({
      success: true,
      global: {
        totalUbicaciones,
        ocupadas,
        porcentajeGlobal,
        totalEstibas,
        totalPaquetes
      },
      racks: racks,
      alertas: alertas.slice(0, 5) // TOP 5 alertas
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
