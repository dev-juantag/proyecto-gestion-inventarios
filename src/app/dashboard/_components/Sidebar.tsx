"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  Truck,
  FileBarChart,
  PlusSquare,
  ScanBarcode,
} from "lucide-react";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark p-4">
      <div className="flex flex-col gap-1">
        <div className="mb-6 px-3">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Operaciones
          </h3>
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                pathname === "/dashboard"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="text-sm font-semibold">Dashboard</span>
            </Link>

            <Link
              href="/dashboard/recepcion"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                pathname === "/dashboard/recepcion"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <PackageSearch size={20} />
              <span className="text-sm font-semibold">Recepción Lotes</span>
            </Link>

            {role === "Super Admin" || role === "Admin" ? (
              <Link
                href="/dashboard/salida"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                  pathname === "/dashboard/salida"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Truck size={20} />
                <span className="text-sm font-semibold">Salida Producción</span>
              </Link>
            ) : null}

            <Link
              href="/dashboard/control"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                pathname === "/dashboard/control"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <FileBarChart size={20} />
              <span className="text-sm font-semibold">Control Drive-in</span>
            </Link>
          </div>
        </div>

        <div className="px-3">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Acceso Rápido
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <button className="group flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-slate-500 transition-all hover:border-primary hover:text-primary dark:border-slate-700">
              <PlusSquare
                size={18}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-xs font-bold uppercase tracking-wider">
                Nuevo Ingreso
              </span>
            </button>
            <button className="group flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-slate-500 transition-all hover:border-primary hover:text-primary dark:border-slate-700">
              <ScanBarcode
                size={18}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-xs font-bold uppercase tracking-wider">
                Escanear Lote
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-primary">
            Estado Sistema
          </span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Servicios activos y conectados en tiempo real.
        </p>
      </div>
    </aside>
  );
}
