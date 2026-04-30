"use client";

import { useState, useEffect } from "react";
import { Server, Plus, AlertCircle, Loader2, Trash2, CheckCircle2, Search, X, SlidersHorizontal } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess("");
        }, 1500);
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
      if (res.ok) {
        fetchRacks();
      }
    } catch (err) {
      alert("Error de red");
    }
  };

  const handleDeletePermanent = async (rackName: string) => {
    if (!confirm(`¡ADVERTENCIA! ¿Estás seguro de ELIMINAR PERMANENTEMENTE el Rack ${rackName}? Esta acción no se puede deshacer.`)) return;
    
    try {
      const res = await fetch("/api/admin/racks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rack: rackName }),
      });
      if (res.ok) {
        fetchRacks();
      }
    } catch (err) {
      alert("Error de red");
    }
  };

  const filteredRacks = racks.filter(r => 
    r.rack.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header con Acción Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Gestión de Racks</h1>
          <p className="font-medium text-slate-500 mt-1">Configuración física de la bodega Drive-in</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> Nuevo Rack
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Buscar rack por nombre (Ej: F-01)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none shadow-sm transition-all"
        />
      </div>

      {/* Grid de Racks Expandido */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 opacity-50">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="font-black text-slate-500 text-xs uppercase tracking-widest">Sincronizando Racks...</p>
          </div>
        ) : filteredRacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Server size={40} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold max-w-xs">
              {searchQuery ? `No encontramos racks con el nombre "${searchQuery}"` : "No hay racks configurados todavía."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRacks.map((r, i) => (
              <div key={i} className={`group relative p-6 rounded-2xl border transition-all hover:shadow-xl ${r.isActive ? 'bg-white border-slate-200 hover:border-primary/40' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 leading-none">RACK {r.rack}</h4>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${r.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {r.isActive ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleActive(r.rack, r.isActive)} 
                      className={`p-2 rounded-xl transition-all ${r.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={r.isActive ? "Pausar" : "Activar"}
                    >
                      {r.isActive ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    </button>
                    <button 
                      onClick={() => handleDeletePermanent(r.rack)} 
                      className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-slate-50 pb-2">
                    <span>CAPACIDAD MAX</span>
                    <span className="text-slate-900">{r._count.id} slots</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>ALTURA</span>
                    <span className="text-slate-900">{r._max.nivel} Niveles</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>COLUMNAS</span>
                    <span className="text-slate-900">{r._max.columna} Cols</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Plus size={24} className="text-primary" /> Nuevo Rack
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddRack} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Identificador del Rack</label>
                <input 
                  type="text" 
                  maxLength={5}
                  value={newRack.rack}
                  onChange={e => setNewRack({...newRack, rack: e.target.value.toUpperCase()})}
                  placeholder="Ej: F-10" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-mono font-black uppercase text-lg transition-all" 
                  required 
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Columnas</label>
                  <input 
                    type="number" 
                    min={1}
                    value={newRack.columnas}
                    onChange={e => setNewRack({...newRack, columnas: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold transition-all" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Niveles</label>
                  <input 
                    type="number" 
                    min={1}
                    value={newRack.niveles}
                    onChange={e => setNewRack({...newRack, niveles: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold transition-all" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Profundidad (LIFO)</label>
                <input 
                  type="number" 
                  min={2}
                  value={newRack.profundidad}
                  onChange={e => setNewRack({...newRack, profundidad: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold transition-all" 
                  required 
                />
              </div>

              {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-xl border border-red-100">{error}</div>}
              {success && <div className="p-4 bg-emerald-50 text-emerald-600 text-xs font-black rounded-xl border border-emerald-100 animate-bounce">{success}</div>}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-4 text-sm font-black text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Crear Rack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
