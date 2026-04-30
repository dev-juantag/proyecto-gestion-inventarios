"use client";

import { useState, useEffect } from "react";
import { Package, Truck, ArrowRightLeft, Search, CheckCircle2, AlertCircle, Maximize2, Loader2, ChevronLeft, Trash2, FileUp, Download } from "lucide-react";
import { MODEL_RULES } from "@/lib/modelRules";
import * as XLSX from "xlsx";

export default function GestionLotesPage() {
  const [activeTab, setActiveTab] = useState("recepcion");
  
  // -- Recepcion State --
  const [formData, setFormData] = useState({
    wo: "",
    numeroLote: "",
    modelo: "",
    fechaIntervencion: "",
    fechaProduccion: "",
    composicion: {
      CHASIS: 0,
      PLASTICO: 0,
      MOTORES: 0,
      TORNILERIA: 0,
      TANQUES: 0,
      GENERAL: 0
    }
  });

  const totalEstibas = Object.values(formData.composicion).reduce((a, b) => a + (Number(b) || 0), 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMap, setStatusMap] = useState<any>(null);

  // Auto-completar composición según modelo
  useEffect(() => {
    const clean = (s: string) => s.replace(/\s+/g, "").toUpperCase();
    const cleanInput = clean(formData.modelo);

    const modelKey = Object.keys(MODEL_RULES).find(k => {
      const cleanKey = clean(k);
      return cleanInput.length > 3 && (cleanInput.includes(cleanKey) || cleanKey.includes(cleanInput));
    });
    
    if (modelKey) {
      const rule = MODEL_RULES[modelKey];
      setFormData(prev => ({
        ...prev,
        composicion: {
          CHASIS: rule.CHASIS || 0,
          PLASTICO: rule.PLASTICO || 0,
          MOTORES: rule.MOTORES || 0,
          TORNILERIA: rule.TORNILERIA || 0,
          TANQUES: rule.TANQUES || 0,
          GENERAL: 0
        }
      }));
    }
  }, [formData.modelo]);

  // -- Inventario State --
  const [inventario, setInventario] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWO, setSelectedWO] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Obtener rol del usuario
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.success) setUserRole(data.user.role);
      });
  }, []);

  // Cargar Inventario cuando se cambia a la pestaña
  useEffect(() => {
    if (activeTab === "inventario") {
      fetchInventario();
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset Recepcion Form
    setFormData({
      wo: "",
      numeroLote: "",
      modelo: "",
      fechaIntervencion: "",
      fechaProduccion: "",
      composicion: { CHASIS: 0, PLASTICO: 0, MOTORES: 0, TORNILERIA: 0, TANQUES: 0, GENERAL: 0 }
    });
    setStatusMap(null);
    // Reset Inventario Search
    setSearchTerm("");
    setSelectedWO(null);
  };

  const fetchInventario = async () => {
    setLoadingInv(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success && data.racks) {
        const allEstibas: any[] = [];
        data.racks.forEach((r: any) => {
          r.canales.forEach((c: any) => {
            c.ubicaciones.forEach((u: any) => {
              if (!u.vacio) {
                allEstibas.push({
                  codigoBarras: u.estiba,
                  lote: u.lote,
                  wo: u.paquete,
                  modelo: u.modelo,
                  fechaProduccion: u.vence,
                  fechaIntervencion: u.intervencion,
                  tipo: u.tipo,
                  rack: r.rack,
                  columna: c.columna,
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

  // Agrupar por WO + Lote para la vista Master
  const groupedByLote = inventario.reduce((acc: any, item) => {
    const key = `${item.wo}-${item.lote}`;
    if (!acc[key]) {
      acc[key] = {
        key: key,
        wo: item.wo,
        lote: item.lote,
        modelo: item.modelo,
        total: 0,
        composicion: {},
        estibas: []
      };
    }
    acc[key].total++;
    acc[key].composicion[item.tipo] = (acc[key].composicion[item.tipo] || 0) + 1;
    acc[key].estibas.push(item);
    return acc;
  }, {});

  const lotesArray = Object.values(groupedByLote) as any[];

  const filteredLotes = lotesArray.filter(g => 
    g.wo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLoteData = selectedWO ? groupedByLote[selectedWO] : null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMap(null);

    try {
      const res = await fetch("/api/inbound/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wo: formData.wo,
          numeroLote: formData.numeroLote,
          modelo: formData.modelo,
          fechaIntervencion: formData.fechaIntervencion,
          fechaProduccion: formData.fechaProduccion,
          composicion: formData.composicion
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMap({ type: "success", data });
        setFormData({ 
          wo: "", 
          numeroLote: "", 
          modelo: "", 
          fechaIntervencion: "", 
          fechaProduccion: "", 
          composicion: { CHASIS: 0, PLASTICO: 0, MOTORES: 0, TORNILERIA: 0, TANQUES: 0, GENERAL: 0 } 
        });
      } else {
        setStatusMap({ type: "error", message: data.error || "Error al asignar ubicacion." });
      }
    } catch (error) {
       setStatusMap({ type: "error", message: "Error de red al conectar con el servidor." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWO = async (wo: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que abra el detalle
    if (!confirm(`¿Estás seguro de eliminar COMPLETAMENTE la WO ${wo}? Se borrarán todas sus estibas y se liberarán las posiciones en el rack.`)) return;
    
    try {
      const res = await fetch(`/api/admin/inventory/wo/${wo}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchInventario();
      } else {
        alert(data.error || "Error al eliminar. Verifique sus permisos de Super Admin.");
      }
    } catch (e) {
      alert("Error de red al intentar eliminar.");
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMap(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        // Ignorar la primera fila (cabeceras)
        const rows = data.slice(1);
        
        const jsonData = rows.filter(row => row.length > 0).map(row => ({
          WO: row[0],
          Lote: row[1],
          Modelo: row[2],
          Fecha_Produccion: row[3],
          Fecha_Intervencion: row[4],
          Codigo_Barras: row[5],
          Tipo: row[6],
          Rack: row[7],
          Columna: row[8],
          Nivel: row[9],
          Profundidad: row[10]
        }));

        const res = await fetch("/api/inventory/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: jsonData }),
        });

        const result = await res.json();
        if (res.ok) {
          alert(`Importación completada: ${result.message}`);
          if (result.errores) console.error("Errores parciales:", result.errores);
          fetchInventario();
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (err) {
        alert("Error al procesar el archivo Excel. Asegúrate de que el formato sea correcto.");
      } finally {
        setIsImporting(false);
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const headers = "sep=,\nWO (A),Lote (B),Modelo (C),Fecha Produccion (D),Fecha Intervencion (E),Codigo Barras (F),Tipo (G),Rack (H),Columna (I),Nivel (J),Profundidad (K)";
    const example = "5465511,L1,CT-100 ES/KS,2024-05-01,2024-05-15,,GENERAL,F-01,1,1,1";
    const blob = new Blob([`${headers}\n${example}`], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_inventario_cedi.csv";
    a.click();
  };

  const handleUpdateDates = async (wo: string) => {
    const fProd = prompt("Nueva Fecha Producción (AAAA-MM-DD):");
    const fInt = prompt("Nueva Fecha Intervención (AAAA-MM-DD):");
    if (!fProd && !fInt) return;

    try {
      const res = await fetch(`/api/admin/inventory/wo/${wo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaProduccion: fProd, fechaIntervencion: fInt })
      });
      if (res.ok) {
        alert("Fechas actualizadas correctamente.");
        fetchInventario();
      } else {
        alert("Error al actualizar fechas.");
      }
    } catch (e) {
      alert("Error de red.");
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
            onClick={() => handleTabChange("recepcion")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "recepcion"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2"><Package size={18} />Ingreso de Estibas</span>
          </button>
          
          <button
            onClick={() => handleTabChange("inventario")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "inventario"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2"><Search size={18} />Inventario Detallado</span>
          </button>

          <button
            onClick={() => handleTabChange("produccion")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === "produccion"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2"><Truck size={18} />Salida a Producción</span>
          </button>

          <button
            onClick={() => handleTabChange("mover")}
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
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Registrar Nuevo Lote</h2>
                    <div className="flex gap-2">
                       {(userRole?.toLowerCase() === "super admin" || userRole?.toLowerCase() === "super_admin") && (
                         <>
                          <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-slate-200">
                              <Download size={16} />
                              Plantilla
                          </button>
                          <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl cursor-pointer transition-all text-xs font-black uppercase tracking-widest border border-primary/20">
                              {isImporting ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                              {isImporting ? "Procesando..." : "Importar Excel"}
                              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} disabled={isImporting} />
                          </label>
                         </>
                       )}
                    </div>
                 </div>
                 <form onSubmit={handleAssign} className="space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">WO (Orden de Lote)</label>
                       <input type="text" required value={formData.wo} onChange={e => setFormData({...formData, wo: e.target.value.toUpperCase()})} placeholder="EJ: 5465511" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono uppercase" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Número de Lote</label>
                       <input type="text" required value={formData.numeroLote} onChange={e => setFormData({...formData, numeroLote: e.target.value.toUpperCase()})} placeholder="EJ: L1" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono uppercase" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Modelo</label>
                       <input 
                         type="text" 
                         list="models-list"
                         required 
                         value={formData.modelo} 
                         onChange={e => setFormData({...formData, modelo: e.target.value.toUpperCase()})} 
                         placeholder="EJ: CT-100 ES/KS" 
                         className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono uppercase" 
                       />
                       <datalist id="models-list">
                         {Object.keys(MODEL_RULES).map(m => (
                           <option key={m} value={m} />
                         ))}
                       </datalist>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Fecha Intervención</label>
                       <input type="date" required value={formData.fechaIntervencion} onChange={e => setFormData({...formData, fechaIntervencion: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Fecha Producción</label>
                       <input type="date" required value={formData.fechaProduccion} onChange={e => setFormData({...formData, fechaProduccion: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                     </div>
                   </div>

                   <div className="border-t border-slate-200 pt-4">
                     <h3 className="text-sm font-bold text-slate-900 mb-4">Composición del Lote (Estibas por tipo)</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {['CHASIS', 'PLASTICO', 'MOTORES', 'TORNILERIA'].map(tipo => (
                         <div key={tipo} className="space-y-1">
                           <label className="text-xs font-bold text-slate-600">{tipo}</label>
                           <input 
                             type="number" 
                             min="0" 
                             value={(formData.composicion as any)[tipo]} 
                             onChange={e => setFormData({
                               ...formData, 
                               composicion: { ...formData.composicion, [tipo]: parseInt(e.target.value) || 0 }
                             })} 
                             className="w-full bg-slate-50 border-slate-200 rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-primary outline-none" 
                           />
                         </div>
                       ))}
                     </div>
                     <div className="mt-4 flex justify-end">
                       <span className="font-black text-slate-800 text-lg bg-slate-100 px-4 py-1 rounded-xl">Total: {totalEstibas} estibas</span>
                     </div>
                   </div>

                   <button disabled={isSubmitting || totalEstibas === 0} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
                     {isSubmitting ? "Trazando Ruta Logística..." : "Ubicar Estiba en Rack LIFO"}
                   </button>
                 </form>
              </div>
            </div>

            <div className="lg:col-span-1">
               <div className={`rounded-2xl border p-6 h-full min-h-[400px] flex flex-col ${statusMap?.type === 'success' ? 'bg-emerald-50 border-emerald-200' : statusMap?.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                  {statusMap?.type === 'success' ? (
                    <div className="flex-1 flex flex-col items-center justify-start text-center animate-in zoom-in-50 duration-300 overflow-y-auto max-h-[600px] scrollbar-hide">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 size={24} />
                      </div>
                      <h3 className="text-xl font-black text-emerald-950 mb-1">¡Estibas Asignadas!</h3>
                      <p className="text-emerald-700 font-bold text-xs mb-4">
                        Lote <span className="bg-emerald-200 px-1 rounded">({statusMap.data?.recomendacion?.loteInfo})</span> asignado con éxito en el <span className="font-black text-emerald-900">RACK {statusMap.data?.recomendacion?.rackPrincipal}</span>.
                      </p>
                      
                      <div className="w-full bg-white rounded-xl border border-emerald-100 p-4 shadow-sm relative overflow-hidden mb-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Ubicación Principal</p>
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-black text-slate-800">RACK {statusMap.data?.recomendacion?.rackPrincipal}</span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{statusMap.data?.recomendacion?.totalAsignadas} Estibas</span>
                        </div>
                      </div>
                      
                      <div className="w-full space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left px-1">Detalle de Posiciones</p>
                        {statusMap.data?.recomendacion?.ubicaciones?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white/60 border border-slate-100 rounded-lg text-[10px]">
                            <div className="flex flex-col items-start">
                              <span className="font-black text-slate-700">{item.pos}</span>
                              <span className="text-[9px] text-slate-400">{item.tipo}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-500 block">{item.code}</span>
                              {item.rack !== statusMap.data?.recomendacion?.rackPrincipal && (
                                <span className="text-[8px] font-black text-amber-600">RACK {item.rack}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => setStatusMap(null)}
                        className="mt-6 w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Registrar Siguiente Lote
                      </button>
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
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedWO && (
                <button 
                  onClick={() => setSelectedWO(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 group"
                  title="Volver al listado"
                >
                  <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedWO ? `Detalle de Orden: ${selectedWO}` : "Inventario por Orden (WO)"}
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  {selectedWO ? `Visualizando estibas y ubicaciones físicas` : "Resumen de composición y cantidades por WO"}
                </p>
              </div>
            </div>
            
            {!selectedWO && (
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar WO, Lote o Modelo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary outline-none text-sm shadow-sm"
                />
              </div>
            )}
          </div>

          {loadingInv ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
              <Loader2 className="animate-spin w-8 h-8 text-primary mx-auto mb-4" />
              <p className="text-slate-500 font-bold">Consultando inventario en tiempo real...</p>
            </div>
          ) : !selectedWO ? (
            /* Vista Master: Listado de WOs */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLotes.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
                  <AlertCircle className="mx-auto text-slate-300 mb-2" size={48} />
                  <p className="text-slate-500 font-bold">No se encontraron lotes con los criterios de búsqueda.</p>
                </div>
              ) : (
                filteredLotes.map((group, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedWO(group.key)}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    {/* Action Group */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                      <button 
                        onClick={(e) => handleDeleteWO(group.wo, e)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar WO completa"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                        <ArrowRightLeft size={20} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orden de Trabajo</span>
                      <div className="flex items-center gap-2 mt-1">
                        <h3 className="text-2xl font-black text-slate-900 font-mono leading-none">{group.wo}</h3>
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded border border-primary/20 uppercase tracking-tighter">Lote {group.lote}</span>
                      </div>
                      <p className="text-xs font-bold text-primary mt-2 uppercase">{group.modelo}</p>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Total Estibas:</span>
                        <span className="bg-slate-900 text-white text-xs font-black px-2 py-1 rounded-lg">{group.total}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(group.composicion).map(([tipo, count]: [any, any]) => (
                          <div key={tipo} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                            <span className="text-[9px] font-black text-slate-400 uppercase">{tipo}</span>
                            <span className="text-[10px] font-bold text-slate-700">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Vista Detalle: Tabla para la WO seleccionada */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xl">
                      {selectedLoteData?.total}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">Desglose de Ubicaciones</h3>
                      <p className="text-xs text-slate-500 font-medium">Estibas físicas asociadas al lote {selectedLoteData?.lote} de la orden {selectedLoteData?.wo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(userRole?.toLowerCase() === "super admin" || userRole?.toLowerCase() === "super_admin") && (
                      <button 
                        onClick={() => handleUpdateDates(selectedLoteData?.wo)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-xs font-bold"
                      >
                        <FileUp size={14} />
                        Editar Fechas (WO)
                      </button>
                    )}
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Referencia de Modelo</span>
                      <p className="font-bold text-slate-900">{selectedLoteData?.modelo}</p>
                    </div>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Lote</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Tipo Componente</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-center">Posición en Rack</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Fechas Clave</th>
                       <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Identificador</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {selectedLoteData?.estibas.map((item: any, i: number) => (
                       <tr key={i} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4">
                           <span className="bg-primary text-white px-2 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase">{item.lote}</span>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase">{item.tipo}</span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-2 min-w-[140px] shadow-sm">
                             <span className="text-xs font-black text-slate-900 uppercase">RACK {item.rack}</span>
                             <span className="text-[10px] font-bold text-slate-400">C{item.columna} • N{item.nivel} • P{item.profundidad}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                 <span className="w-8 text-[9px] font-black text-slate-300 uppercase">Prod:</span>
                                 <span className="text-[10px] text-slate-600 font-bold">{item.fechaProduccion ? new Date(item.fechaProduccion).toLocaleDateString() : 'N/A'}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className="w-8 text-[9px] font-black text-slate-300 uppercase">Int:</span>
                                 <span className="text-[10px] text-slate-600 font-bold">{item.fechaIntervencion ? new Date(item.fechaIntervencion).toLocaleDateString() : 'N/A'}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400 tracking-tighter">{item.codigoBarras}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
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
