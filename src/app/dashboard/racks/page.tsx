"use client";

import { useState, useEffect } from "react";
import { Server, Plus, AlertCircle, Loader2, Trash2, CheckCircle2 } from "lucide-react";

type RackSummary = {
  rack: string;
  isActive: boolean;
  _count: { id: number };
  _max: { nivel: number; columna: number };
};

export default function RacksConfig() {
  const [racks, setRacks] = useState<RackSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newRack, setNewRack] = useState({
    rack: "",
    columnas: 1,
    niveles: 7,
    profundidad: 10,
  });

  const fetchRacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/racks");
      const data = await res.json();
      if (data.success) {
        setRacks(data.racks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRacks();
  }, []);

  const handleAddRack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/racks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRack),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setNewRack({ rack: "", columnas: 1, niveles: 7, profundidad: 10 });
        fetchRacks();
      } else {
        setError(data.error || "Error al crear matriz");
      }
    } catch (err) {
      setError("Error de red.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (rackName: string, currentStatus: boolean) => {
    const action = currentStatus ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de ${action} el Rack ${rackName}?`)) return;
    
    try {
      const res = await fetch("/api/admin/racks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rack: rackName, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchRacks();
      } else {
        alert(data.error || `No se pudo ${action}`);
      }
    } catch (err) {
      alert("Error de red");
    }
  };

  const handleDeletePermanent = async (rackName: string) => {
    if (!confirm(`¡ADVERTENCIA! ¿Estás seguro de ELIMINAR PERMANENTEMENTE el Rack ${rackName}? Esta acción no se puede deshacer y borrará todas las ubicaciones asociadas.`)) return;
    
    try {
      const res = await fetch("/api/admin/racks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rack: rackName }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchRacks();
      } else {
        alert(data.error || "No se pudo eliminar el rack");
      }
    } catch (err) {
      alert("Error de red");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Gestión de Racks (Drive-in)
          </h1>
          <p className="font-medium text-slate-500 mt-1">
            Administra la estructura física del almacén y genera espacios virtuales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Creación */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
               <Plus size={18} className="text-primary" /> Nuevo Rack (Bloque)
             </h3>
             <form onSubmit={handleAddRack} className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700">Letra del Rack</label>
                 <input 
                   type="text" 
                   maxLength={5}
                   value={newRack.rack}
                   onChange={e => setNewRack({...newRack, rack: e.target.value.toUpperCase()})}
                   placeholder="Ej: F-10" 
                   className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono uppercase" 
                   required 
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Columnas largas</label>
                   <input 
                     type="number" 
                     min={1}
                     value={newRack.columnas}
                     onChange={e => setNewRack({...newRack, columnas: Number(e.target.value)})}
                     className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" 
                     required 
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Niveles altura</label>
                   <input 
                     type="number" 
                     min={1}
                     value={newRack.niveles}
                     onChange={e => setNewRack({...newRack, niveles: Number(e.target.value)})}
                     className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" 
                     required 
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700">Profundidad LIFO</label>
                 <input 
                   type="number" 
                   min={2}
                   value={newRack.profundidad}
                   onChange={e => setNewRack({...newRack, profundidad: Number(e.target.value)})}
                   className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" 
                   required 
                 />
               </div>

               {error && (
                 <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{error}</div>
               )}
               {success && (
                 <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg">{success}</div>
               )}

               <button 
                 type="submit" 
                 disabled={isSubmitting}
                 className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-70"
               >
                 {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Generar Rack"}
               </button>
             </form>
           </div>
        </div>

        {/* Lista de Racks */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
               <Server size={18} className="text-slate-500" /> Racks Virtualizados Existentes
             </h3>

             {isLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
             ) : racks.length === 0 ? (
               <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
                 <p className="text-slate-500 font-medium">No hay Racks creados. Usa el formulario para virtualizar el almacén.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {racks.map((r, i) => (
                   <div key={i} className={`p-5 rounded-2xl border ${r.isActive ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200 grayscale opacity-70'}`}>
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h4 className="text-2xl font-black text-slate-900 tracking-tight">RACK {r.rack}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${r.isActive ? 'text-primary' : 'text-slate-400'}`}>
                            {r.isActive ? 'Activo' : 'Desactivado'}
                          </span>
                       </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleToggleActive(r.rack, r.isActive)} 
                            className={`${r.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'} transition-colors p-2 rounded-lg`}
                            title={r.isActive ? "Desactivar" : "Activar"}
                          >
                            {r.isActive ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                          </button>
                          <button 
                            onClick={() => handleDeletePermanent(r.rack)} 
                            className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3 mb-2">
                       <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                         <p className="text-[10px] text-slate-500 font-bold uppercase">Columnas Largas</p>
                         <p className="text-lg font-black text-slate-700">{r._max.columna}</p>
                       </div>
                       <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                         <p className="text-[10px] text-slate-500 font-bold uppercase">Niveles Altura</p>
                         <p className="text-lg font-black text-slate-700">{r._max.nivel}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                       <CheckCircle2 size={14} className="text-emerald-500" />
                       {r._count.id} Canales físicos en total
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
