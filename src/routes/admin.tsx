import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Ticket, Inbox, Mail, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Ceylon Kandy Events" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/orders", label: "Ticket Orders", icon: Ticket },
  { to: "/admin/bookings", label: "Bookings", icon: Inbox },
  { to: "/admin/inquiries", label: "Inquiries", icon: Mail },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { location } = useRouterState();

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-onyx text-gold">Loading…</div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-onyx px-6 text-center">
        <div>
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">Restricted</p>
          <h1 className="font-display text-4xl text-ivory mb-4">Admin Sign-In Required</h1>
          <Link to="/login" className="inline-block px-6 py-3 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs rounded-sm">Sign In</Link>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-onyx px-6 text-center">
        <div>
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">Forbidden</p>
          <h1 className="font-display text-4xl text-ivory mb-2">Admin Access Only</h1>
          <p className="text-muted-foreground text-sm mb-6">Your account doesn't have admin privileges.</p>
          <Link to="/" className="inline-block px-6 py-3 border border-gold text-gold uppercase tracking-[0.2em] text-xs hover:bg-gold hover:text-primary-foreground transition-all">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-gold-soft bg-onyx">
        <div className="p-6 border-b border-gold-soft">
          <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Ceylon Kandy</p>
          <p className="font-display text-2xl text-ivory">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {ADMIN_NAV.map((n) => {
            const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors rounded-sm ${
                  active ? "bg-gradient-gold text-primary-foreground font-medium" : "text-ivory/70 hover:text-gold hover:bg-charcoal"
                }`}
              >
                <Icon size={16} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gold-soft space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm text-ivory/70 hover:text-gold rounded-sm">
            <ArrowLeft size={16} /> Back to Site
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ivory/70 hover:text-destructive rounded-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-gold-soft bg-onyx">
          <p className="font-display text-xl text-gradient-gold">Admin</p>
          <Link to="/" className="text-xs text-gold uppercase tracking-[0.2em]">Site →</Link>
        </header>
        <nav className="md:hidden flex overflow-x-auto border-b border-gold-soft bg-onyx">
          {ADMIN_NAV.map((n) => {
            const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`px-4 py-3 text-xs uppercase tracking-[0.2em] whitespace-nowrap ${active ? "text-gold border-b-2 border-gold" : "text-ivory/60"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 overflow-x-hidden p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
