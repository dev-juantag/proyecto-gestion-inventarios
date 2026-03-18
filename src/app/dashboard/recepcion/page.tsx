"use client";

import { ScanBarcode, PackageSearch, Save, Info, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function RecepcionLotes() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Recepción de Lotes
          </h1>
          <p className="font-medium text-slate-500 mt-1">
            Registrar pallets entrantes y asignarlos a ubicaciones.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
          <ScanBarcode size={20} />
          <span>Escanear Código</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario Area */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             <form className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ID del Lote</label>
                   <input type="text" placeholder="LOT-2023-XXXX" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none font-mono uppercase" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Fecha de Ingreso</label>
                   <input type="date" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Producto</label>
                   <select className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none">
                     <option>Electrónicos</option>
                     <option>Abarrotes - General</option>
                     <option>Congelados</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cantidad</label>
                   <div className="flex gap-2">
                     <input type="number" placeholder="0" className="flex-1 bg-slate-50 border-slate-200 rounded-xl px-4 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" />
                     <select className="w-24 bg-slate-50 border-slate-200 rounded-xl px-2 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none text-sm font-bold">
                       <option>PLT</option>
                       <option>BOX</option>
                       <option>UNT</option>
                     </select>
                   </div>
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Estado Inicial</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-xl font-bold hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 size={16} /> QC Passed
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                      <Clock size={16} /> Pendiente
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 py-3 bg-amber-500/5 text-amber-600 border border-amber-500/30 rounded-xl font-bold hover:bg-amber-500/20 transition-colors">
                      <AlertTriangle size={16} /> En Espera
                    </button>
                  </div>
               </div>

               <div className="pt-4 flex gap-4">
                 <button type="button" className="flex-1 flex justify-center items-center gap-2 bg-primary text-white rounded-xl py-4 font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                   <Save size={20} />
                   Asignar a Estante
                 </button>
                 <button type="button" className="px-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    Limpiar
                 </button>
               </div>
             </form>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
             <h3 className="font-bold text-primary flex items-center gap-2 mb-4">
               <Info size={18} /> Recomendación de Slot
             </h3>
             <div className="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Zona B • Estante 12</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mb-3">SLOT-B12-A04</p>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[65%]"></div>
                </div>
                <p className="text-[10px] mt-2 text-slate-500">65% Ocupación - Óptimo para electrónicos</p>
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
             <h3 className="font-bold text-sm mb-4">Entradas Recientes</h3>
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                   <PackageSearch size={16} />
                 </div>
                 <div className="flex-1">
                   <p className="text-xs font-bold">LOT-A982</p>
                   <p className="text-[10px] text-slate-500">Hace 2 mins</p>
                 </div>
                 <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded uppercase">Guardado</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
