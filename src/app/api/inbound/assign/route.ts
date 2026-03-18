import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { codigoPaquete, lotId, productionDate, productType, quantity, quantityType } = body;

    if (!codigoPaquete || !lotId || !productionDate) {
      return NextResponse.json({ error: "Faltan datos obligatorios (Paquete, Lote, Fecha Producción)" }, { status: 400 });
    }

    const prodDate = new Date(productionDate);

    // 1. Obtener o crear paquete
    let paquete = await prisma.paquete.findUnique({ where: { codigo: codigoPaquete } });
    if (!paquete) {
      paquete = await prisma.paquete.create({
        data: { codigo: codigoPaquete, descripcion: `Paquete autogenerado ${codigoPaquete}` }
      });
    }

    // 2. Obtener o crear Lote
    let lote = await prisma.lote.findUnique({ where: { lotId } });
    if (!lote) {
      lote = await prisma.lote.create({
        data: {
          lotId,
          paqueteId: paquete.id,
          productionDate: prodDate,
          productType: productType || "General",
          quantity: Number(quantity) || 1,
          quantityType: quantityType || "PLT",
          status: "STORED"
        }
      });
    }

    // 3. Crear identificador único de estiba temporalmente
    const codigoBarras = `EST-${lotId}-${Date.now().toString().slice(-4)}`;
    
    // Aquí empieza el algoritmo de asignación LIFO/FEFO
    
    // Obtenemos todos los canales activos con sus ubicaciones
    const canales = await prisma.canal.findMany({
      where: { isActive: true },
      include: {
        ubicaciones: {
          include: {
            estiba: {
              include: { lote: true }
            }
          },
          orderBy: { profundidad: 'asc' } // 1 a 10
        }
      }
    });

    let bestUbicacion = null;
    let highestScore = -1;

    for (const canal of canales) {
      // Ubicaciones vacías en este canal
      const vacías = canal.ubicaciones.filter((u: any) => !u.estibaId);
      if (vacías.length === 0) continue; 
      
      // La ubicación libre más profunda disponible (Drive-In rellena de 10 hacia 1)
      const slotLibre = vacías.reduce((prev: any, curr: any) => (curr.profundidad > prev.profundidad ? curr : prev));

      // Buscar si el canal tiene ocupantes en frente del slot libre (profundidad < slotLibre.profundidad)
      // Como llenamos del 10 al 1, los ocupantes reales estarán de slotLibre.profundidad - 1 hacia 1.
      // Wait: En LIFO, el espacio libre más profundo disponible es el que le sigue al último que insertamos.
      // Así que ESTE nuevo slot será tapado por los futuros. 
      // ¿Pero tapa él a alguien? NO, porque va detrás de todos los vacíos.
      // Bloquea a los que YA ESTÁN en el fondo (profundidad > slotLibre.profundidad).
      
      const bloqueadosPorMi = canal.ubicaciones.filter(
        (u: any) => u.estibaId && u.profundidad > slotLibre.profundidad && u.estiba?.lote
      );

      let esValidoporFEFO = true;

      // REGLA DE ORO Anti-Bloqueos: 
      // Yo (nuevo) no puedo vencer DESPUÉS que nadie a quien yo esté bloqueando (los del fondo).
      // Si yo venzo el 30 de abril y el del fondo vence el 15 de abril, ¡le estoy bloqueando su salida temprana!
      // Por ende, Mi Fecha Produccion <= Fecha Produccion Fondo
      for (const atrapado of bloqueadosPorMi) {
        if (prodDate > new Date(atrapado.estiba!.lote.productionDate)) {
          esValidoporFEFO = false;
          break;
        }
      }

      if (!esValidoporFEFO) continue;

      // Calcular Puntuación del Canal
      let score = 0;
      const mismasEstibas = bloqueadosPorMi.filter((u: any) => u.estiba?.lote.paqueteId === paquete.id);
      
      if (mismasEstibas.length > 0) {
        score += 1000; // Priorizar canales donde ya hay inventario del mismo paquete
      } else if (bloqueadosPorMi.length === 0) {
        score += 500; // Canal completamente vacío, buena segunda opción
      } else {
        score += 100; // Canal con otro paquete pero válido por FEFO
      }

      // Desempate: preferir canales con menos espacio libre para no segmentar el almacén
      score += (10 - vacías.length);

      if (score > highestScore) {
        highestScore = score;
        bestUbicacion = slotLibre;
      }
    }

    if (!bestUbicacion) {
      return NextResponse.json({ error: "No hay slots válidos que cumplan la regla FEFO o el almacén está lleno." }, { status: 400 });
    }

    // 4. Ejecutar la recomendación (Crear la Estiba físicamente en el slot elegido)
    const nuevaEstiba = await prisma.estiba.create({
      data: {
        codigoBarras,
        loteId: lote.id,
        status: "STORED"
      }
    });

    const ubicacionActualizada = await prisma.ubicacion.update({
      where: { id: bestUbicacion.id },
      data: { estibaId: nuevaEstiba.id },
      include: { canal: true }
    });

    return NextResponse.json({
      success: true,
      recomendacion: {
        slotFormat: `SLOT-${ubicacionActualizada.canal.rack}-N${ubicacionActualizada.canal.nivel}-P${ubicacionActualizada.profundidad}`,
        rack: ubicacionActualizada.canal.rack,
        nivel: ubicacionActualizada.canal.nivel,
        profundidad: ubicacionActualizada.profundidad,
        ocupacionCanal: `${11 - ubicacionActualizada.profundidad}0%`,
        estiba: codigoBarras
      }
    });
    
  } catch (error) {
    console.error("Assign error", error);
    return NextResponse.json({ error: "Error interno asignando la estiba" }, { status: 500 });
  }
}
