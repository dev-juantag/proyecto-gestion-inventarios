"use client";

import { useRouter } from "next/navigation";
import { Search, Bell, Settings, LogOut, Warehouse } from "lucide-react";

export default function Topbar({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    // Para simplificar, simplemente eliminamos cookie via redirección o se podría llamar API de logout.
    // Aquí podemos forzar limpiando cookes si expone.
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <header className="z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-background-dark md:px-8">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 text-primary">
          <Warehouse size={28} />
          <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white hidden md:block">
            LogiTrack Pro
          </h2>
        </div>
        <label className="flex h-10 w-full min-w-[200px] max-w-sm flex-col md:min-w-64">
          <div className="flex flex-1 items-stretch rounded-lg bg-slate-100 w-full dark:bg-slate-800">
            <div className="flex items-center justify-center pl-4 text-slate-500">
              <Search size={18} />
            </div>
            <input
              className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-500 focus:ring-0 dark:text-white outline-none px-3"
              placeholder="Buscar Lote o Ubicación..."
            />
          </div>
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-primary/10 dark:bg-slate-800 dark:text-slate-300">
          <Bell size={20} />
        </button>
        <button 
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 md:hidden"
        >
          <LogOut size={20} />
        </button>

        <div className="mx-2 hidden h-8 w-[1px] bg-slate-200 dark:bg-slate-800 md:block"></div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {user.role}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-primary/20">
            <span className="font-bold text-primary">{user.name.charAt(0)}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors ml-2"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}
