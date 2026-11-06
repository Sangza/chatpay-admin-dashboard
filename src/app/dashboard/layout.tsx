import Sidebar from "./sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50 md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
