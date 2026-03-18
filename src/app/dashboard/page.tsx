"use client";

import { 
  Database,
  BoxSelect,
  Tags,
  AlertTriangle,
  AlertCircle,
  Info as InfoIcon,
  CheckCircle2
} from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Inventario General
          </h1>
          <p className="font-medium text-slate-500">
            Bodega Central | Sector A-F | Última sinc: hace 2 min
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800">
            Últimas 24h
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20">
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Database size={24} />
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">
              +2.4%
            </span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">
            Capacidad Ocupada
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              84.2%
            </span>
            <span className="text-xs text-slate-400">/ 100%</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-primary" style={{ width: "84%" }}></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
              <BoxSelect size={24} />
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">
              +120
            </span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">
            Total Bins Activos
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              12,450
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            92% de espacio total utilizado
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Tags size={24} />
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">
              +15
            </span>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-500">
            Lotes/Batches Activos
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              892
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Dando tracking a 48 categorías global
          </p>
        </div>
      </div>

      {/* Main Bottom Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Heatmap Area */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mapa de Calor de Uso de Estantes
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-200"></span> Baja
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <span className="h-2 w-2 rounded-full bg-primary"></span> Alta
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* Dummy Data Heatmap */}
              {[98, 76, 54, 32, 88, 12, 45, 99, 0, 65, 50, 30].map(
                (val, idx) => (
                  <div
                    key={idx}
                    className={`flex aspect-square flex-col items-center justify-center rounded-lg p-2 transition-all hover:scale-105 cursor-pointer ${
                      val > 80
                        ? "bg-primary/90 text-white shadow-lg shadow-primary/20"
                        : val > 50
                        ? "bg-primary/60 text-white"
                        : val > 20
                        ? "bg-primary/30 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase opacity-80">
                      {idx < 6 ? "A" : "B"}
                      {(idx % 6) + 1}
                    </span>
                    <span className="text-xs font-bold">{val}%</span>
                  </div>
                )
              )}
            </div>
            <div className="mt-8 flex items-center justify-between rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={18} />
                <span>Estante B2 acercándose al límite crítico (90%+)</span>
              </div>
              <button className="font-bold text-primary hover:underline">
                Reasignar Lotes
              </button>
            </div>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Alertas Recientes
            </h3>
            <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">
              4 NUEVAS
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-500/5 p-3 dark:border-red-900/50 dark:bg-red-500/10">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <p className="leading-tight text-sm font-bold text-slate-900 dark:text-white">
                  Estante 4 Casi Lleno
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  98% capacidad. Se recomienda reubicación a Sector C.
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase text-red-500">
                  Justo Ahora
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 opacity-60 dark:border-slate-800 dark:bg-slate-800">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <div>
                <p className="leading-tight text-sm font-bold text-slate-900 dark:text-white">
                  Lote Confirmado
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Lote #LOT-9821 guardado correctamente en Bay 3.
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase text-slate-400">
                  Hace 3 hrs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
