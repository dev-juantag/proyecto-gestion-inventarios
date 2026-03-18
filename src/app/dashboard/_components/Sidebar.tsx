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
  Server,
} from "lucide-react";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between overflow-y-auto border-r border-slate-200  bg-white  p-4">
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
                  : "text-slate-600 hover:bg-slate-100  :bg-slate-800"
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
                  : "text-slate-600 hover:bg-slate-100  :bg-slate-800"
              }`}
            >
              <PackageSearch size={20} />
              <span className="text-sm font-semibold">Recepción Lotes</span>
            </Link>

            {role === "Super Admin" || role === "Admin" ? (
              <>
                <Link
                  href="/dashboard/racks"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    pathname === "/dashboard/racks"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-600 hover:bg-slate-100  :bg-slate-800"
                  }`}
                >
                  <Server size={20} />
                  <span className="text-sm font-semibold">Gestión de Racks</span>
                </Link>
              </>
            ) : null}
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
        <p className="text-xs text-slate-600 ">
          Servicios activos y conectados en tiempo real.
        </p>
      </div>
    </aside>
  );
}
