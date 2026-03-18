import { verifyJWT } from "@/lib/auth/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = await verifyJWT(token);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <Topbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={user.role as string} />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark/50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
