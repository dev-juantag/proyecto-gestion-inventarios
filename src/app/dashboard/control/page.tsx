"use client";

import { ScanBarcode, Truck, PlusSquare, Search } from "lucide-react";

export default function ControlDriveIn() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Control Drive-in (10x7)
          </h1>
          <p className="font-medium text-slate-500 mt-1">
            Gestión de ingresos por rampa central y control de pesos.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
            <ScanBarcode size={20} />
            <span>Leer Manifiesto</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario / Input */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
               <Truck className="text-primary" />
               Nuevo Ingreso Vehicular
             </h3>
             <form className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Placa del Vehículo</label>
                   <input type="text" placeholder="AB-123-CD" className="mt-1 w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none uppercase font-mono tracking-widest" />
                 </div>
                 <div>
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Carga</label>
                   <select className="mt-1 w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none">
                     <option>Carga Fría</option>
                     <option>Carga Seca</option>
                     <option>Materiales Peligrosos</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Peso Registrado (Kg)</label>
                   <input type="number" placeholder="4500" className="mt-1 w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" />
                 </div>
                 <div>
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Muelle Asignado</label>
                   <select className="mt-1 w-full border-primary/50 bg-primary/5 text-primary rounded-xl px-4 py-3 dark:bg-primary/10 font-bold focus:ring-2 focus:ring-primary outline-none">
                     <option>Muelle 1 - Rápido</option>
                     <option>Muelle 2 - Pesados</option>
                     <option>Muelle 3 - General</option>
                   </select>
                 </div>
               </div>
               
               <div className="pt-4">
                 <button type="button" className="w-full flex justify-center items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-3.5 font-bold hover:opacity-90 transition-opacity">
                   <PlusSquare size={20} />
                   Registrar Ingreso en Bitácora
                 </button>
               </div>
             </form>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-primary flex items-center gap-2">
                 Estado de Muelles
               </h3>
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
             </div>
             
             <div className="space-y-3">
               <div className="bg-white dark:bg-slate-900 p-3 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800">
                 <span className="text-sm font-bold">Muelle 1</span>
                 <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-1 rounded uppercase tracking-wider">Ocupado</span>
               </div>
               <div className="bg-white dark:bg-slate-900 p-3 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800">
                 <span className="text-sm font-bold">Muelle 2</span>
                 <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-1 rounded uppercase tracking-wider">Libre</span>
               </div>
               <div className="bg-white dark:bg-slate-900 p-3 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-800">
                 <span className="text-sm font-bold">Muelle 3</span>
                 <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-1 rounded uppercase tracking-wider">En Mantenimiento</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
