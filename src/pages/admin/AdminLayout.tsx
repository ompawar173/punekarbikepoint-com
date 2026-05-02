import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Bike, MessageSquare, Image, LogOut, Tag, FileText, Images } from "lucide-react";

const AdminLayout = () => {
  const { user, isAdmin, isManager, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><p>Loading...</p></div>;
  if (!user || (!isAdmin && !isManager)) return <Navigate to="/admin" replace />;

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/bikes", label: "Bikes", icon: Bike },
    { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
    { to: "/admin/coupons", label: "Coupons", icon: Tag },
    { to: "/admin/invoices", label: "Billing / Invoices", icon: FileText },
    { to: "/admin/slider", label: "Homepage Slider", icon: Images },
    { to: "/admin/gallery", label: "Gallery", icon: Image },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4 flex flex-col">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-bold text-blue-700">Punekar Bike Point</h2>
          <p className="text-xs text-slate-500">Admin Panel · {isAdmin ? "Admin" : "Manager"}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" onClick={signOut} className="mt-auto w-full justify-start text-slate-600 hover:text-blue-700 hover:bg-blue-50">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </aside>

      {/* Content */}
      <main className="admin-scope flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
