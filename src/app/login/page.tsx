"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Warehouse, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Recovery States
  const [view, setView] = useState<"LOGIN" | "RECOVER_EMAIL" | "RECOVER_RESET">("LOGIN");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Algo salió mal.");
      }
    } catch (err) {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Código de recuperación enviado. Revisa tu bandeja.");
        setView("RECOVER_RESET");
      } else {
        setError(data.error || "Algo salió mal.");
      }
    } catch (err) {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, token: recoveryToken, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Contraseña actualizada exitosamente. Ya puedes ingresar.");
        setView("LOGIN");
        setPassword("");
        setRecoveryToken("");
        setNewPassword("");
      } else {
        setError(data.error || "Algo salió mal.");
      }
    } catch (err) {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50  flex items-center justify-center p-4 selection:bg-primary/30">
      
      {/* Background Decorators */}
      <div className="absolute top-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10 space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white  border border-slate-200  shadow-xl shadow-primary/10">
             <Warehouse className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 ">
              {view === "LOGIN" && "LogiTrack Pro"}
              {view === "RECOVER_EMAIL" && "Recuperación"}
              {view === "RECOVER_RESET" && "Nueva Contraseña"}
            </h1>
            <p className="text-sm text-slate-500  font-medium">
              {view === "LOGIN" && "Recepción de Lotes & Control"}
              {view === "RECOVER_EMAIL" && "Ingresa tu correo para enviarte un código"}
              {view === "RECOVER_RESET" && "Ingresa el código que te enviamos al correo"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
          
          {successMsg && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-600 text-center animate-in fade-in slide-in-from-top-2">
              {successMsg}
            </div>
          )}

          {view === "LOGIN" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="admin@logitrack.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button type="button" onClick={() => { setView("RECOVER_EMAIL"); setError(""); setSuccessMsg(""); }} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-600 text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Validando...</span>
                  </>
                ) : (
                  "Ingresar al Sistema"
                )}
              </button>
            </form>
          )}

          {view === "RECOVER_EMAIL" && (
            <form onSubmit={handleRecoverEmail} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Tu Correo Registrado
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="ejemplo@logitrack.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-600 text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    "Enviar Código de Recuperación"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setView("LOGIN"); setError(""); setSuccessMsg(""); }}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                  Volver al Login
                </button>
              </div>
            </form>
          )}

          {view === "RECOVER_RESET" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Código de 6 Caracteres
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={recoveryToken}
                  onChange={(e) => setRecoveryToken(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all uppercase"
                  placeholder="XXXXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Nueva Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-600 text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Validando...</span>
                    </>
                  ) : (
                    "Guardar Nueva Contraseña"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setView("LOGIN"); setError(""); setSuccessMsg(""); }}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="mt-8 text-center text-xs font-semibold text-slate-500 ">
          <p>© 2026 Juan Taguado – Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}
