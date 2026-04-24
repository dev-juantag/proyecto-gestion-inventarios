import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wo, numeroLote, modelo, fechaIntervencion, fechaProduccion, composicion } = body;

    if (!wo || !numeroLote || !fechaIntervencion || !fechaProduccion || !composicion) {
      return NextResponse.json({ error: "Faltan datos obligatorios (WO, Número de Lote, Fechas, Composición)" }, { status: 400 });
    }

    const prodDate = new Date(fechaProduccion);
    const interDate = new Date(fechaIntervencion);

    const cantEstibas = Object.values(composicion).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number;
    if (cantEstibas === 0) {
      return NextResponse.json({ error: "El lote debe tener al menos 1 estiba" }, { status: 400 });
    }

    const tiposAcrear: string[] = [];
    Object.entries(composicion).forEach(([tipo, cant]) => {
      for (let i = 0; i < (Number(cant) || 0); i++) {
        tiposAcrear.push(tipo);
      }
    });

    // 1. Obtener Lote (y bloquear si ya existe)
    let lote = await (prisma as any).lote.findUnique({
      where: {
        wo_numeroLote: {
          wo,
          numeroLote
        }
      } as any
    });

    if (lote) {
      return NextResponse.json({ 
        error: `El lote ${numeroLote} de la WO ${wo} ya se encuentra registrado en el inventario.` 
      }, { status: 400 });
    }

    lote = await (prisma as any).lote.create({
      data: {
        wo,
        numeroLote,
        modelo: modelo || "NO ESPECIFICADO",
        cantidadEstibas: cantEstibas,
        fechaIntervencion: interDate,
        fechaProduccion: prodDate
      } as any
    });

    // 2. Obtener la estructura completa del almacén
    const racks = await (prisma as any).rack.findMany({
      where: { isActive: true },
      include: {
        ubicaciones: {
          include: {
            estiba: {
              include: { lote: true }
            }
          },
          orderBy: [
            { columna: 'asc' },
            { nivel: 'asc' },
            { profundidad: 'desc' } // De 10 a 1 (Atrás hacia adelante)
          ]
        }
      }
    });

    // Agrupar ubicaciones en "canales" virtuales (Rack + Columna + Nivel)
    const canalesVirtuales: any[] = [];

    racks.forEach((rack: any) => {
      for (let c = 1; c <= rack.columnas; c++) {
        for (let n = 1; n <= rack.niveles; n++) {
          const ubicacionesDelCanal = rack.ubicaciones.filter((u: any) => u.columna === c && u.nivel === n);
          const vacias = ubicacionesDelCanal.filter((u: any) => !u.estibaId);
          
          if (vacias.length === 0) continue;

          // La más profunda disponible (la primera en la lista de vacias porque ordenamos desc)
          const maxProfVacia = vacias[0].profundidad;

          // Las que están más al fondo (mayor profundidad que la primera vacía)
          const atrapadas = ubicacionesDelCanal.filter((u: any) => u.estibaId && u.profundidad > maxProfVacia && u.estiba?.lote);

          let esValidoporFEFO = true;
          // FEFO Anti-Bloqueo: Si mi fecha de producción es > a la del fondo, bloqueo una que debería salir antes.
          for (const atrapado of atrapadas) {
            if (prodDate > new Date(atrapado.estiba!.lote.fechaProduccion)) {
              esValidoporFEFO = false;
              break;
            }
          }

          if (esValidoporFEFO) {
            let score = 0;
            // Agrupamiento: Si ya hay estibas del mismo WO + Lote en el canal, darle prioridad máxima
            const mismasEstibas = atrapadas.filter((u: any) => u.estiba?.lote?.wo === wo && u.estiba?.lote?.numeroLote === numeroLote);
            if (mismasEstibas.length > 0) score += 5000;
            else if (atrapadas.length === 0) score += 1000; // Canal vacío es bueno
            else score += 100;
            
            // Preferencia por llenar canales (compactación)
            score += (10 - vacias.length); 

            canalesVirtuales.push({
              key: `R${rack.nombre}-C${c}-N${n}`,
              rack,
              columna: c,
              nivel: n,
              vacias,
              atrapadas,
              score
            });
          }
        }
      }
    });

    const slotsAsignados: any[] = [];
    let motoresRestantes = tiposAcrear.filter(t => t === "MOTORES");
    let otrosRestantes = tiposAcrear.filter(t => t !== "MOTORES");

    // 3. Selección de Rack y Asignación
    // 3. Selección de Rack y Asignación
    const racksOrdenados = racks.map((rack: any) => {
      const canalesRack = canalesVirtuales.filter((c: any) => c.rack.id === rack.id);
      const capTotal = canalesRack.reduce((acc: number, c: any) => acc + c.vacias.length, 0);
      let score = capTotal;
      if (capTotal >= cantEstibas) score += 10000;
      const existingInRack = rack.ubicaciones.filter((u: any) => u.estiba?.lote?.wo === wo && u.estiba?.lote?.numeroLote === numeroLote).length;
      score += existingInRack * 1000;
      return { rack, score, canalesRack };
    }).sort((a: any, b: any) => b.score - a.score);

    for (const rInfo of racksOrdenados) {
      if (motoresRestantes.length === 0 && otrosRestantes.length === 0) break;

      const rack = rInfo.rack;
      // Para este rack, vamos a iterar por "Slices de Profundidad" en cada columna
      for (let c = 1; c <= rack.columnas; c++) {
        for (let p = rack.profundidad; p >= 1; p--) {
          // Para cada posición (Columna C, Profundidad P), llenamos de Arriba hacia Abajo (N7 -> N1)
          for (let n = rack.niveles; n >= 1; n--) {
            if (motoresRestantes.length === 0 && otrosRestantes.length === 0) break;

            const ubi = rack.ubicaciones.find((u: any) => u.columna === c && u.nivel === n && u.profundidad === p && !u.estibaId);
            if (!ubi || slotsAsignados.some(s => s.ubicacion.id === ubi.id)) continue;

            const canalValido = canalesVirtuales.find((cv: any) => cv.rack.id === rack.id && cv.columna === c && cv.nivel === n);
            if (!canalValido) continue;

            let tipoAsignado = "";
            if (n === 1) {
              if (motoresRestantes.length > 0) {
                tipoAsignado = "MOTORES";
                motoresRestantes.shift();
              } else if (otrosRestantes.length > 0) {
                tipoAsignado = otrosRestantes.shift()!;
              }
            } else {
              if (otrosRestantes.length > 0) {
                tipoAsignado = otrosRestantes.shift()!;
              } else {
                continue; 
              }
            }

            if (tipoAsignado) {
              slotsAsignados.push({
                key: `R${rack.nombre}-C${c}-N${n}`,
                rackId: rack.id,
                ubicacion: ubi,
                rack: rack.nombre,
                columna: c,
                nivel: n,
                profundidad: p,
                tipo: tipoAsignado
              });
            }
          }
        }
      }
    }

    if (motoresRestantes.length > 0 || otrosRestantes.length > 0) {
      return NextResponse.json({ 
        error: `Capacidad insuficiente. No se pudieron ubicar ${motoresRestantes.length + otrosRestantes.length} estibas.` 
      }, { status: 400 });
    }

    // 4. Operación masiva en base de datos
    // Generamos los datos de las estibas primero
    const batchTimestamp = Date.now().toString().slice(-4);
    const estibasToCreate = slotsAsignados.map((slot, i) => ({
      codigoBarras: `EST-${numeroLote}-${batchTimestamp}-${i+1}`,
      tipo: slot.tipo,
      loteId: lote.id,
      status: "STORED"
    }));

    const result = await (prisma as any).$transaction(async (tx: any) => {
      // Usamos createManyAndReturn para obtener los IDs en una sola operación (Prisma 5.14+)
      const createdEstibas = await tx.estiba.createManyAndReturn({
        data: estibasToCreate
      });

      // Mapeamos cada estiba creada a su ubicación correspondiente
      const updatePromises = createdEstibas.map((estiba: any, i: number) => {
        return tx.ubicacion.update({
          where: { id: slotsAsignados[i].ubicacion.id },
          data: { estibaId: estiba.id }
        });
      });

      await Promise.all(updatePromises);
      
      return createdEstibas.map((estiba: any, i: number) => ({
        slotFormat: `RACK ${slotsAsignados[i].rack} - C${slotsAsignados[i].columna} - N${slotsAsignados[i].nivel} - P${slotsAsignados[i].profundidad}`,
        estiba: estiba.codigoBarras
      }));
    }, {
      maxWait: 10000, // Tiempo máximo de espera para adquirir la conexión
      timeout: 30000  // Tiempo máximo para que se complete la transacción (30s)
    });

    return NextResponse.json({
      success: true,
      recomendacion: {
        rack: slotsAsignados[0].rack,
        nivel: slotsAsignados[0].nivel,
        profundidad: slotsAsignados[0].profundidad,
        estiba: result[0].estiba,
        totalAsignadas: slotsAsignados.length,
        detalle: result
      }
    });

  } catch (error) {
    console.error("Assign error", error);
    return NextResponse.json({ error: "Error interno asignando las estibas" }, { status: 500 });
  }
}
