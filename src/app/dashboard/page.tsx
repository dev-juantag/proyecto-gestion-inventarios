"use client";

import { useState, useEffect } from "react";
import { 
  Database, BoxSelect, Tags, AlertTriangle, AlertCircle, Info as InfoIcon, CheckCircle2,
  Server, Maximize2, X, ChevronRight, Hash, Clock
} from "lucide-react";

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRack, setSelectedRack] = useState<any>(null);
  const [selectedCanal, setSelectedCanal] = useState<any>(null);
  const [selectedUbiId, setSelectedUbiId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if(data.success) {
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 30s
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const openRackModal = (rackName: string) => {
    const r = stats?.racks.find((r: any) => r.rack === rackName);
    if(r) {
      setSelectedRack(r);
      setSelectedCanal(null);
      setSelectedUbiId(null);
    }
  };

  const closeRackModal = () => {
    setSelectedRack(null);
    setSelectedUbiId(null);
  };

  if(loading) {
    return (
       <div className="flex h-full items-center justify-center p-20">
         <div className="flex flex-col items-center gap-4 opacity-50">
           <Database size={40} className="animate-pulse" />
           <p className="font-bold text-slate-500 tracking-widest text-sm uppercase">Cargando Datos Reales...</p>
         </div>
       </div>
    );
  }

  const { global, racks, alertas } = stats || {};

  return (
    <div className="space-y-8 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Inventario General (En Vivo)
          </h1>
          <p className="font-medium text-slate-500">
            Bodega Central (Drive-in) | Sincronizado en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStats} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Refrescar Ahora
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Capacidad */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Database size={24} />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Capacidad General Ocupada</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{global?.porcentajeGlobal || 0}%</span>
            <span className="text-xs text-slate-400">/ 100%</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${global?.porcentajeGlobal || 0}%` }}></div>
          </div>
        </div>

        {/* Estibas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
              <BoxSelect size={24} />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Estibas / Pallets Físicos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{global?.totalEstibas || 0}</span>
          </div>
          <p className="mt-4 text-xs font-bold text-primary">Unidades alojadas en racks</p>
        </div>

        {/* Paquetes Container */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Tags size={24} />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Total Embarques/Containers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{global?.totalPaquetes || 0}</span>
          </div>
          <p className="mt-4 text-xs font-bold text-amber-600">Lotes de motos distribuidos</p>
        </div>
      </div>

      {/* Main Bottom Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Racks Area */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
             <div>
               <h3 className="text-lg font-bold text-slate-900">Estado de Racks (Drive-in)</h3>
               <p className="text-xs font-medium text-slate-500 mt-1">Clic en un Rack para ver ocupación lateral</p>
             </div>
          </div>
          <div className="p-6 flex-1 bg-slate-50">
            {racks && racks.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {racks.map((r: any) => {
                    const pct = r.totalUbicaciones > 0 ? ((r.ocupadas / r.totalUbicaciones) * 100).toFixed(1) : "0";
                    return (
                      <div 
                        key={r.rack} 
                        onClick={() => openRackModal(r.rack)}
                        className="group flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-lg hover:shadow-primary/5 cursor-pointer transition-all"
                      >
                         <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-primary/10 transition-colors">
                                 <Server className="text-slate-500 group-hover:text-primary transition-colors" size={24} />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-slate-800">RACK {r.rack}</h4>
                                 <p className="text-xs font-bold text-slate-400">{r.totalUbicaciones} Posiciones Max</p>
                              </div>
                           </div>
                           <button className="text-primary bg-primary/5 hover:bg-primary/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 size={16} />
                           </button>
                         </div>
                         <div className="mt-2">
                            <div className="flex justify-between text-sm font-bold mb-2">
                               <span className="text-slate-600">Ocupación</span>
                               <span className={Number(pct) > 90 ? "text-red-500" : "text-slate-900"}>{pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                               <div className={`h-full ${Number(pct) > 90 ? "bg-red-500" : "bg-primary"}`} style={{ width: `${pct}%`}}></div>
                            </div>
                         </div>
                      </div>
                    )
                 })}
               </div>
            ) : (
               <div className="text-center py-10 opacity-60">
                 <Server size={32} className="mx-auto text-slate-400 mb-3" />
                 <p className="font-bold text-slate-500">No hay Racks creados</p>
                 <p className="text-xs text-slate-400">Diríjase a Gestión de Racks en el Menú Principal.</p>
               </div>
            )}
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900">Alertas de Capacidad</h3>
            {alertas?.length > 0 && (
              <span className="rounded bg-red-500 px-2 py-1 text-[10px] font-black text-white ml-2">
                {alertas.length} CRÍTICAS
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {alertas?.length > 0 ? (
               alertas.map((al: any, i: number) => (
                 <div key={i} className="flex gap-3 rounded-xl border border-red-200 bg-red-500/5 p-3">
                   <AlertCircle className="text-red-500 shrink-0" size={20} />
                   <div>
                     <p className="leading-tight text-sm font-bold text-slate-900">{al.message}</p>
                     <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{al.time}</p>
                   </div>
                 </div>
               ))
            ) : (
               <div className="flex flex-col items-center justify-center text-center py-8 opacity-60 h-full">
                 <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                 <p className="font-bold text-slate-600">Todo en orden</p>
                 <p className="text-[10px] text-slate-400 mt-1">No hay canales sobre el 90%</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL / VISTA LATERAL INTERACTIVA */}
      {selectedRack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-[95vw] xl:w-[65vw] h-[90vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              
                  {selectedCanal && (
                     <div className="w-96 border-r border-slate-200 bg-white flex flex-col h-full animate-in slide-in-from-left-8 duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-20 shrink-0">
                        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50">
                           <div>
                              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                 <Hash className="text-primary" /> DETALLE DE CANAL
                              </h3>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                 Nivel {selectedCanal.nivel} • Rack {selectedRack.rack}
                              </p>
                           </div>
                           <button onClick={() => setSelectedCanal(null)} className="p-1.5 bg-slate-200/50 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-lg transition-colors">
                              <X size={16} />
                           </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                           <h4 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">Profundidad LIFO (1 al {selectedCanal.maxCapacidad})</h4>
                           
                           <div className="flex flex-col-reverse gap-2">
                              {/* In Drive-in, visually index 1 is closest (front), index 10 is farthest (back) */}
                              {selectedCanal.ubicaciones.map((ubi: any, i: number) => (
                                 <div key={i} className={`p-4 rounded-xl border flex items-center gap-4 relative overflow-hidden transition-all ${ubi.vacio ? 'bg-white border-dashed border-slate-300 opacity-60' : 'bg-white border-primary/30 shadow-sm'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-sm ${ubi.vacio ? 'bg-slate-100 text-slate-400' : 'bg-primary text-white'}`}>
                                       P{ubi.profundidad}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       {ubi.vacio ? (
                                          <p className="font-bold text-slate-400 text-xs">Posición Libre</p>
                                       ) : (
                                          <>
                                             <p className="font-black text-slate-900 truncate">Lote: {ubi.lote || 'Desconocido'}</p>
                                             <p className="text-[10px] font-bold text-slate-500 truncate">{ubi.paquete || 'Sin contenedor asociado'}</p>
                                             <p className="text-[9px] font-bold text-primary mt-1 uppercase tracking-wider bg-primary/10 inline-block px-1.5 py-0.5 rounded">Vence: {ubi.vence ? new Date(ubi.vence).toLocaleDateString() : 'N/A'}</p>
                                          </>
                                       )}
                                    </div>
                                    {!ubi.vacio && (
                                       <button title="Ver en Recepción" className="text-slate-400 hover:text-primary transition-colors bg-slate-50 hover:bg-primary/10 p-2 rounded-lg">
                                          <ChevronRight size={16} />
                                       </button>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
                  
                  {/* Contenido Principal Modal (Matriz) */}
                  <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
                     <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                             <Server className="text-primary" /> VISTA LATERAL: RACK {selectedRack.rack}
                          </h2>
                          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                             Ocupación Total: {((selectedRack.ocupadas / selectedRack.totalUbicaciones) * 100).toFixed(1)}% ({selectedRack.ocupadas} Estibas)
                          </p>
                        </div>
                        <button onClick={closeRackModal} className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                           <X size={20} />
                        </button>
                     </div>
                     
                     <div className="flex-1 overflow-auto p-4 lg:p-8">
                        <div className="flex h-full">
                           <div className="flex flex-col-reverse justify-between gap-2 flex-1 overflow-x-auto pb-4">
                              {/* Render rows (niveles) from top to bottom. */}
                              {Array.from(new Set(selectedRack.canales.map((c: any) => c.nivel)))
                         .sort((a: any, b: any) => a - b)
                         .map((nivel: any) => {
                            // En esta estructura, solo hay 1 canal por nivel en cada Rack
                            const canal = selectedRack.canales.find((c: any) => c.nivel === nivel);
                            if(!canal) return null;
                            const ocupacionPct = (canal.ocupadas / canal.maxCapacidad) * 100;
                            const isSelected = selectedCanal?.id === canal.id;
                            return (
                               <div key={`nivel-${nivel}`} className="flex flex-1 gap-2 min-h-[3.5rem]">
                                  <div className="w-14 md:w-16 shrink-0 h-full flex items-center justify-center bg-slate-200/80 rounded-xl font-black text-slate-500 text-sm md:text-base border-r-4 border-slate-300 shadow-sm">
                                     N{nivel}
                                  </div>
                                  <div className="flex flex-1 gap-1 md:gap-2 justify-between items-stretch relative group-level min-w-0">
                                     {/* Renderizamos las 10 posiciones individuales. Prof. 10 (Fondo) a la izquierda, Prof. 1 (Frente) a la derecha */}
                                     {canal.ubicaciones
                                       .slice()
                                       .sort((a: any, b: any) => b.profundidad - a.profundidad)
                                       .map((ubi: any) => {
                                          return (
                                            <div 
                                              key={ubi.id}
                                              onClick={() => { setSelectedCanal(canal); setSelectedUbiId(ubi.id); }}
                                              title={`Profundidad ${ubi.profundidad} ${ubi.vacio ? '(VACÍO)' : `• Lote: ${ubi.lote}`}`}
                                              className={`
                                                flex-1 min-w-[28px] h-full rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center shrink-0
                                                ${selectedUbiId === ubi.id ? '!ring-4 !ring-sky-400 !border-sky-400 scale-[1.12] z-30 shadow-[0_0_20px_rgba(56,189,248,0.4)]' : isSelected ? 'border-primary ring-2 ring-primary/30 z-10' : ''}
                                                ${ubi.vacio ? (selectedUbiId === ubi.id ? '!bg-sky-50 opacity-100 !border-sky-400 text-sky-800' : 'border-slate-200 bg-slate-50 opacity-60 hover:border-slate-300 hover:opacity-100') : (selectedUbiId === ubi.id ? '!bg-sky-500 !border-sky-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]' : 'border-slate-800 bg-slate-800 text-white shadow-sm hover:bg-slate-700 scale-[1.02]')}
                                              `}
                                            >
                                               <span className={`text-[10px] md:text-[11px] font-black tracking-wide ${ubi.vacio ? (selectedUbiId === ubi.id ? 'text-sky-600' : 'text-slate-400') : 'text-white'}`}>
                                                  P{ubi.profundidad}
                                               </span>
                                               {!ubi.vacio && (
                                                  <span className={`text-[8px] md:text-[9px] font-bold uppercase text-center truncate w-full px-1 ${selectedUbiId === ubi.id ? 'text-sky-100' : 'text-white/80'}`}>
                                                     ESTIBA
                                                  </span>
                                               )}
                                            </div>
                                          )
                                      })
                                     }
                                  </div>
                               </div>
                            )
                         })
                       }
                           </div>

                           {/* Sutil Letrero Verde MÁXIMO a la derecha */}
                           <div className="w-10 ml-4 shrink-0 bg-emerald-50 border-emerald-400 border border-l-4 rounded-r-2xl flex flex-col items-center justify-center my-1 cursor-default shadow-sm border-dashed">
                              <span 
                                 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600 whitespace-nowrap"
                                 style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                              >
                                 Salida LIFO (Frente)
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
            </div>
         </div>
       )}

    </div>
  );
}
