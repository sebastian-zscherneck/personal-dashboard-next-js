import { Sidebar } from "@/components/dashboard/sidebar";
import { BusinessProvider } from "@/components/dashboard/business-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessProvider>
      <div className="min-h-screen bg-[#050505]">
        <Sidebar />
        <main className="ml-64">{children}</main>
      </div>
    </BusinessProvider>
  );
}
