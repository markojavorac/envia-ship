import { AdminProvider } from "@/lib/admin/admin-context";

export const metadata = {
  title: "Admin Dashboard | ENVÍA",
  description: "Manage orders, products, and view analytics",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="admin" className="min-h-screen bg-background">
      <AdminProvider>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </AdminProvider>
    </div>
  );
}
