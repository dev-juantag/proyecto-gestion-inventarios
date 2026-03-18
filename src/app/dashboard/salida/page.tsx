"use client";

import { Download, Search, Filter, MoreVertical } from "lucide-react";

export default function SalidaProduccion() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Salidas a Producción
          </h1>
          <p className="font-medium text-slate-500 mt-1">
            Gestión de despachos y asignación de lotes para producción.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
            <Download size={20} />
            <span>Reporte Salidas</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex gap-2 w-full md:w-auto">
             <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg px-3 bg-slate-50 dark:bg-slate-800/50 flex-1 md:w-64">
               <Search size={16} className="text-slate-400" />
               <input type="text" placeholder="Buscar Orden ID..." className="bg-transparent border-none py-2 px-3 text-sm focus:ring-0 outline-none w-full" />
             </div>
             <button className="flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
               <Filter size={18} />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Orden Salida</th>
                <th className="px-6 py-4">Lote Asociado</th>
                <th className="px-6 py-4">Ubicación Origen</th>
                <th className="px-6 py-4">Cant. Requerida</th>
                <th className="px-6 py-4">Destino</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold">OUT-992-K</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">LOT-2023-A982</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs">SLOT-B12-A04</td>
                <td className="px-6 py-4 font-bold">15 PLT</td>
                <td className="px-6 py-4"><span className="text-xs">Línea Prod. 1</span></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary"><MoreVertical size={16} /></button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold">OUT-812-J</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">LOT-2023-B881</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs">SLOT-A02-B01</td>
                <td className="px-6 py-4 font-bold">8 BOX</td>
                <td className="px-6 py-4"><span className="text-xs">Línea Prod. 4</span></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-primary"><MoreVertical size={16} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
