import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Bike, MessageSquare, Image, LogOut } from "lucide-react";

const AdminLayout = () => {
  const { user, isAdmin, isManager, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  if (!user || (!isAdmin && !isManager)) return <Navigate to="/admin" replace />;

  const links = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/bikes", label: "Bikes", icon: Bike },
    { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
    { to: "/admin/gallery", label: "Gallery", icon: Image },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-foreground">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "Manager"}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" onClick={signOut} className="mt-auto w-full justify-start text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
