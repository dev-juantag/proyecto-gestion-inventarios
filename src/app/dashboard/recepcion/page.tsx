"use client";

import { useState, useEffect } from "react";
import { Package, Truck, ArrowRightLeft, Search, CheckCircle2, AlertCircle, Maximize2 } from "lucide-react";

export default function GestionLotesPage() {
  const [activeTab, setActiveTab] = useState("recepcion");
  
  // -- Recepcion State --
  const [formData, setFormData] = useState({
    codigoPaquete: "",
    lotId: "",
    productionDate: "",
    productType: "Motos Semi-Ensambladas (CKD)",
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMap, setStatusMap] = useState<any>(null);

  // -- Inventario State --
  const [inventario, setInventario] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);

  // Cargar Inventario cuando se cambia a la pestaña
  useEffect(() => {
    if (activeTab === "inventario") {
      fetchInventario();
    }
  }, [activeTab]);

  const fetchInventario = async () => {
    setLoadingInv(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if(data.success && data.racks) {
         const allEstibas: any[] = [];
         data.racks.forEach((r: any) => {
           r.canales.forEach((c: any) => {
             c.ubicaciones.forEach((u: any) => {
               if(!u.vacio) {
                 allEstibas.push({
                   codigoBarras: u.estiba,
                   loteId: u.lote,
                   paquete: u.paquete,
                   vence: u.vence,
                   rack: r.rack,
                   nivel: c.nivel,
                   profundidad: u.profundidad
                 });
               }
             });
           });
         });
         setInventario(allEstibas);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInv(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMap(null);

    try {
      const res = await fetch("/api/inbound/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoPaquete: formData.codigoPaquete,
          lotId: formData.lotId,
          productionDate: formData.productionDate,
          productType: formData.productType,
          quantity: formData.quantity
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMap({ type: "success", data });
        setFormData({ ...formData, lotId: "", codigoPaquete: "" }); // reset partially
      } else {
        setStatusMap({ type: "error", message: data.error || "Error al asignar ubicacion." });
      }
    } catch (error) {
       setStatusMap({ type: "error", message: "Error de red al conectar con el servidor." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Gestión de Lotes y Estibas</h1>
        <p className="font-medium text-slate-500">Módulo centralizado para Recepción, Inventario y Salidas a Producción.</p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("recepcion")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "recepcion"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2"><Package size={18} />Ingreso de Estibas</span>
          </button>
          
          <button
            onClick={() => setActiveTab("inventario")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "inventario"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2"><Search size={18} />Inventario Detallado</span>
          </button>

          <button
            onClick={() => setActiveTab("produccion")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "produccion"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2"><Truck size={18} />Salida a Producción</span>
          </button>

          <button
            onClick={() => setActiveTab("mover")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "mover"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2"><ArrowRightLeft size={18} />Mover / Reubicar</span>
          </button>
        </nav>
      </div>

      {/* --- PESTAÑA RECEPCION --- */}
      {activeTab === "recepcion" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                 <h2 className="text-xl font-bold text-slate-900 mb-6">Registrar Nueva Estiba / Pallet</h2>
                 <form onSubmit={handleAssign} className="space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Container / Embarque ID</label>
                       <input type="text" required value={formData.codigoPaquete} onChange={e => setFormData({...formData, codigoPaquete: e.target.value.toUpperCase()})} placeholder="CONT-2026-001" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono uppercase" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Lote de Repuestos (ID)</label>
                       <input type="text" required value={formData.lotId} onChange={e => setFormData({...formData, lotId: e.target.value.toUpperCase()})} placeholder="LOT-MOTO-XXXX" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono uppercase" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Fecha Producción/Vence</label>
                       <input type="date" required value={formData.productionDate} onChange={e => setFormData({...formData, productionDate: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Sector de Mercancía</label>
                       <select value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none">
                         <option>Motos Semi-Ensambladas (CKD)</option>
                         <option>Repuestos Motor y Chasis</option>
                         <option>Llantas y Plásticos</option>
                         <option>Aceites y Químicos</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Cantidad (Estibas Físicas)</label>
                       <input type="number" min="1" max="10" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                     </div>
                   </div>

                   <button disabled={isSubmitting} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
                     {isSubmitting ? "Trazando Ruta Logística..." : "Ubicar Estiba en Rack LIFO"}
                   </button>
                 </form>
              </div>
           </div>

           <div className="lg:col-span-1">
              <div className={`rounded-2xl border p-6 h-full min-h-[400px] flex flex-col ${statusMap?.type === 'success' ? 'bg-emerald-50 border-emerald-200' : statusMap?.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                 {statusMap?.type === 'success' ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-50 duration-300">
                     <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
                       <CheckCircle2 size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-emerald-950 mb-2">¡Asignación Exitosa!</h3>
                     <p className="text-emerald-700 font-medium text-sm mb-6">Diríjase a la ubicación abajo descrita.</p>
                     
                     <div className="w-full bg-white rounded-xl border border-emerald-100 p-4 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Posición Drive-in Asignada</p>
                       <div className="flex justify-between items-baseline mb-4">
                         <span className="text-3xl font-black text-slate-800">RACK {statusMap.data.recomendacion.rack}</span>
                         <span className="text-lg font-bold text-slate-600">Nivel {statusMap.data.recomendacion.nivel}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-bold border-t border-slate-100 pt-3">
                         <span className="text-slate-500">Profundidad (Fondo):</span>
                         <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Posición {statusMap.data.recomendacion.profundidad}/10</span>
                       </div>
                     </div>
                     
                     <div className="mt-6 p-3 bg-white/60 border border-emerald-100 rounded-xl w-full">
                       <p className="text-[10px] font-bold text-slate-400 uppercase text-left mb-1">Código de Barra Generado</p>
                       <p className="font-mono font-bold text-slate-800 text-lg tracking-wider">{statusMap.data.recomendacion.estiba}</p>
                     </div>
                   </div>
                 ) : statusMap?.type === 'error' ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <AlertCircle size={48} className="text-red-500 mb-4" />
                     <h3 className="text-xl font-black text-red-950 mb-2">Error de Ubicación</h3>
                     <p className="text-red-700 font-medium text-sm">{statusMap.message}</p>
                   </div>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                     <Maximize2 size={48} className="text-slate-400 mb-4" />
                     <h3 className="text-lg font-bold text-slate-900 mb-2">Esperando Escaneo</h3>
                     <p className="text-slate-500 text-sm max-w-[200px]">Complete el formulario para que el algoritmo asigne la ubicación óptima.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* --- PESTAÑA INVENTARIO --- */}
      {activeTab === "inventario" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Inventario Físico de Estibas</h2>
              <div className="bg-white border rounded-lg px-3 py-1.5 flex items-center gap-2">
                 <Search size={16} className="text-slate-400" />
                 <input type="text" placeholder="Buscar lote o contenedor..." className="text-sm outline-none w-48 font-medium" />
              </div>
           </div>
           
           <div className="p-0">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                 <tr>
                   <th className="px-6 py-4">Físico / Barcode</th>
                   <th className="px-6 py-4">Lote ID</th>
                   <th className="px-6 py-4">Embarque</th>
                   <th className="px-6 py-4">Ubicación Fija</th>
                   <th className="px-6 py-4">Vencimiento/Producción</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {loadingInv ? (
                   <tr><td colSpan={5} className="text-center py-10 text-slate-400 font-bold">Cargando inventario...</td></tr>
                 ) : inventario.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-10 text-slate-500 font-medium">No hay estibas almacenadas en los racks actualmente.</td></tr>
                 ) : (
                   inventario.map((inv, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 font-mono font-bold text-slate-800">{inv.codigoBarras}</td>
                       <td className="px-6 py-4 font-bold text-primary">{inv.loteId}</td>
                       <td className="px-6 py-4 text-slate-600 font-medium">{inv.paquete}</td>
                       <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                             Rack {inv.rack} <span className="text-slate-300">|</span> Nv {inv.nivel} <span className="text-slate-300">|</span> Prof {inv.profundidad}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-slate-500 font-medium">{new Date(inv.vence).toLocaleDateString()}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* --- PESTAÑA PRODUCCION --- */}
      {activeTab === "produccion" && (
         <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Truck size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Despacho hacia Ensamblaje</h2>
            <p className="text-slate-500 max-w-lg mx-auto mb-6">Esta sección sugiere automáticamente la estiba de componentes más antigua acorde al Algoritmo FEFO, destrabando la estrategia LIFO del Drive-in.</p>
            <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors">
               Iniciar Secuencia de Extracción
            </button>
         </div>
      )}

      {/* --- PESTAÑA MOVER --- */}
      {activeTab === "mover" && (
         <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <ArrowRightLeft size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Reubicación Manual</h2>
            <p className="text-slate-500 max-w-lg mx-auto mb-6">Mueve lotes que están siendo bloqueados físicamente o consolida espacios parciales dentro del almacén.</p>
            <button className="bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl hover:border-slate-300 transition-colors">
               Abrir Escáner de Reubicación
            </button>
         </div>
      )}

    </div>
  );
}
