"use client";

import { useRouter } from "next/navigation";
import { Search, Bell, Settings, LogOut, Warehouse } from "lucide-react";

export default function Topbar({ user }: { user: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3   md:px-8">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 text-primary">
          <Warehouse size={28} />
          <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900  hidden md:block">
            LogiTrack Pro
          </h2>
        </div>

      </div>
      <div className="flex items-center gap-4">

        <button 
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200   :bg-red-500/20 md:hidden"
        >
          <LogOut size={20} />
        </button>

        <div className="mx-2 hidden h-8 w-[1px] bg-slate-200  md:block"></div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-slate-900 ">{user.name}</p>
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
