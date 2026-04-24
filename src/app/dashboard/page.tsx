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

  const getWOColor = (wo: string) => {
    if (!wo) return 'border-slate-200 bg-slate-50 text-slate-400';
    const colors = [
      'bg-sky-600 border-sky-700',
      'bg-emerald-600 border-emerald-700',
      'bg-violet-600 border-violet-700',
      'bg-amber-600 border-amber-700',
      'bg-rose-600 border-rose-700',
      'bg-indigo-600 border-indigo-700',
      'bg-orange-600 border-orange-700',
      'bg-cyan-600 border-cyan-700',
      'bg-lime-600 border-lime-700',
      'bg-fuchsia-600 border-fuchsia-700',
    ];
    let hash = 0;
    for (let i = 0; i < wo.length; i++) {
      hash = wo.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
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
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Inventario General (En Vivo)</h1>
          <p className="font-medium text-slate-500">Bodega Central (Drive-in) | Sincronizado en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStats} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Refrescar Ahora
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500"><Database size={24} /></div>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500"><BoxSelect size={24} /></div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Estibas / Pallets Físicos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{global?.totalEstibas || 0}</span>
          </div>
          <p className="mt-4 text-xs font-bold text-primary">Unidades alojadas en racks</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500"><Tags size={24} /></div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">Total Embarques/Containers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{global?.totalPaquetes || 0}</span>
          </div>
          <p className="mt-4 text-xs font-bold text-amber-600">Lotes de motos distribuidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
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
                           <button className="text-primary bg-primary/5 hover:bg-primary/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 size={16} /></button>
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
               </div>
            )}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900">Alertas de Capacidad</h3>
            {alertas?.length > 0 && <span className="rounded bg-red-500 px-2 py-1 text-[10px] font-black text-white ml-2">{alertas.length} CRÍTICAS</span>}
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
               </div>
            )}
          </div>
        </div>
      </div>

      {selectedRack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl w-[98vw] xl:w-[90vw] h-[95vh] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
              
                  {selectedUbiId && (
                     <div className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col h-full animate-in slide-in-from-left-8 duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-20 shrink-0">
                        {(() => {
                           const ubiActual = selectedRack.canales.flatMap((c:any) => c.ubicaciones).find((u:any) => u.id === selectedUbiId);
                           const woTarget = ubiActual?.paquete;
                           const loteTarget = ubiActual?.lote;
                           
                           if (!woTarget) {
                              return (
                                 <>
                                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                                       <div className="flex justify-between items-start mb-4">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalle de Ubicación</span>
                                          <button onClick={() => setSelectedUbiId(null)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><X size={16} /></button>
                                       </div>
                                       <h3 className="text-xl font-black text-slate-900">Posición Libre</h3>
                                       <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">P{ubiActual?.profundidad} • NIVEL {ubiActual?.nivel}</p>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50/30">
                                       <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                          <Hash className="text-slate-300" size={32} />
                                       </div>
                                       <p className="text-sm font-bold text-slate-400">Esta ubicación se encuentra disponible para nuevas estibas.</p>
                                    </div>
                                 </>
                              );
                           }

                           // Todas las estibas del mismo WO + Lote en este rack
                           const estibasDelLote = selectedRack.canales.flatMap((c:any) => c.ubicaciones).filter((u:any) => u.paquete === woTarget && u.lote === loteTarget);
                           const totalEstibas = estibasDelLote.length;
                           
                           return (
                              <>
                                 <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
                                    <div className="flex justify-between items-start mb-4">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Detalle de Lote</span>
                                       <button onClick={() => setSelectedUbiId(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={16} /></button>
                                    </div>
                                    <h3 className="text-3xl font-black font-mono leading-none">{woTarget}</h3>
                                    <p className="text-xs font-bold text-primary mt-2 uppercase">{ubiActual?.modelo}</p>
                                    
                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                       <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                          <p className="text-[10px] font-bold text-white/40 uppercase">Total Estibas</p>
                                          <p className="text-xl font-black">{totalEstibas}</p>
                                       </div>
                                       <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                          <p className="text-[10px] font-bold text-white/40 uppercase">Lote</p>
                                          <p className="text-xl font-black">{ubiActual?.lote}</p>
                                       </div>
                                    </div>
                                 </div>
                                 
                                 <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicaciones en Rack {selectedRack.rack}</p>
                                    {estibasDelLote.map((ubi: any, i: number) => (
                                       <div key={i} onClick={() => setSelectedUbiId(ubi.id)} className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all cursor-pointer ${ubi.id === selectedUbiId ? 'border-primary bg-white shadow-md ring-4 ring-primary/10' : 'bg-white border-slate-100 opacity-80 hover:opacity-100 hover:border-slate-200'}`}>
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${getWOColor(ubi.paquete)} text-white`}>
                                             P{ubi.profundidad}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black text-slate-400">NIVEL {ubi.nivel}</span>
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{ubi.tipo}</span>
                                             </div>
                                             <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-bold text-slate-500">Prod: {ubi.vence ? new Date(ubi.vence).toLocaleDateString() : 'N/A'}</p>
                                                {ubi.id === selectedUbiId && <span className="text-[10px] font-black text-primary animate-pulse">SELECCIONADO</span>}
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </>
                           );
                        })()}
                     </div>
                  )}
                  
                  <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
                     <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                             <Server className="text-primary" size={32} /> VISTA LATERAL: RACK {selectedRack.rack}
                          </h2>
                          <div className="flex items-center gap-4 mt-1">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 pr-4">
                               Ocupación: {((selectedRack.ocupadas / selectedRack.totalUbicaciones) * 100).toFixed(1)}%
                             </p>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                               {selectedRack.ocupadas} de {selectedRack.totalUbicaciones} Posiciones
                             </p>
                          </div>
                        </div>
                        <button onClick={closeRackModal} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all shadow-sm"><X size={24} /></button>
                     </div>
                     
                     <div className="flex-1 overflow-auto p-6 lg:p-10 flex flex-col items-center">
                        <div className="w-full h-full min-w-[800px] flex gap-4">
                           <div className="flex flex-col-reverse justify-between gap-4 flex-1">
                              {Array.from(new Set(selectedRack.canales.map((c: any) => c.nivel)))
                          .sort((a: any, b: any) => (a as number) - (b as number))
                          .map((nivel: any) => {
                             const canal = selectedRack.canales.find((c: any) => c.nivel === nivel);
                             if(!canal) return null;
                             const isSelected = selectedCanal?.id === canal.id;
                             return (
                                <div key={`nivel-${nivel}`} className="flex items-stretch gap-4 h-full">
                                   <div className={`w-20 shrink-0 flex items-center justify-center rounded-2xl font-black text-lg border-r-4 shadow-md transition-all ${nivel === 1 ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                      N{nivel}
                                   </div>
                                   <div className="flex flex-1 gap-2 justify-between items-stretch relative">
                                      {canal.ubicaciones
                                        .slice()
                                        .sort((a: any, b: any) => b.profundidad - a.profundidad)
                                        .map((ubi: any) => {
                                           const woColor = getWOColor(ubi.paquete);
                                           const isFocused = selectedUbiId === ubi.id;
                                           return (
                                             <div 
                                               key={ubi.id}
                                               onClick={() => { setSelectedCanal(canal); setSelectedUbiId(ubi.id); }}
                                               className={`
                                                 flex-1 min-w-[60px] rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center relative overflow-hidden
                                                 ${isFocused ? '!ring-4 ring-primary !scale-110 z-30 shadow-2xl' : 'hover:scale-[1.03]'}
                                                 ${ubi.vacio ? 'border-slate-200 bg-white/50 border-dashed opacity-40 hover:opacity-100' : woColor}
                                               `}
                                             >
                                                <span className={`text-[11px] font-black tracking-widest mb-1 ${ubi.vacio ? 'text-slate-300' : 'text-white/40'}`}>P{ubi.profundidad}</span>
                                                {!ubi.vacio && (
                                                   <div className="flex flex-col items-center text-center">
                                                      <span className="text-[10px] font-black text-white leading-tight">{ubi.paquete}</span>
                                                      <span className="text-[8px] font-bold text-white/70 uppercase mt-0.5">{ubi.tipo}</span>
                                                   </div>
                                                )}
                                                {isFocused && <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>}
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

                           <div className="w-12 shrink-0 bg-emerald-500/10 border-2 border-emerald-500/30 border-dashed rounded-3xl flex flex-col items-center justify-center shadow-inner">
                              <span 
                                 className="text-xs font-black uppercase tracking-[0.6em] text-emerald-600 whitespace-nowrap"
                                 style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                              >
                                 Frente de Salida (LIFO)
                              </span>
                           </div>
                        </div>
                     </div>
                     
                     {/* Legend */}
                     <div className="p-4 bg-white border-t border-slate-200 flex gap-6 overflow-x-auto no-scrollbar shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 shrink-0">
                           <div className="w-3 h-3 bg-slate-100 border border-dashed border-slate-300 rounded-sm"></div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase">Vacío</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase">Nivel 1 (Pesados)</span>
                        </div>
                        <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Agrupación por WO:</span>
                           {/* Muestra algunos colores de ejemplo o los actuales si hubiera muchos */}
                           <div className="flex gap-1">
                              {[0,1,2,3].map(i => (
                                 <div key={i} className={`w-3 h-3 rounded-sm opacity-50 bg-${['sky','emerald','violet','amber'][i]}-600`}></div>
                              ))}
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
