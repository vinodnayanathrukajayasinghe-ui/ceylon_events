import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Ticket, Inbox, Mail, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Stats {
  events: number;
  orders: number;
  bookings: number;
  inquiries: number;
  customers: number;
  revenue: number;
  newBookings: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [ev, ord, bk, inq, customers, paidOrd, newBk, recBk, recOrd] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("ticket_orders").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("ticket_orders").select("total_amount").eq("payment_status", "paid"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("ticket_orders").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        events: ev.count || 0,
        orders: ord.count || 0,
        bookings: bk.count || 0,
        inquiries: inq.count || 0,
        customers: customers.count || 0,
        revenue: (paidOrd.data || []).reduce((s, r: any) => s + Number(r.total_amount || 0), 0),
        newBookings: newBk.count || 0,
      });
      setRecentBookings(recBk.data || []);
      setRecentOrders(recOrd.data || []);
    })();
  }, []);

  const cards = [
    { label: "Events", value: stats?.events ?? "—", to: "/admin/events", icon: CalendarDays },
    { label: "Ticket Orders", value: stats?.orders ?? "—", to: "/admin/orders", icon: Ticket },
    { label: "Bookings", value: stats?.bookings ?? "—", to: "/admin/bookings", icon: Inbox, badge: stats?.newBookings },
    { label: "Inquiries", value: stats?.inquiries ?? "—", to: "/admin/inquiries", icon: Mail },
    { label: "Customers", value: stats?.customers ?? "—", to: "/admin/customers", icon: Users },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-[0.4em] text-gold uppercase">Overview</p>
        <h1 className="font-display text-4xl md:text-5xl text-ivory mt-2">Dashboard</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="relative p-6 border border-gold-soft bg-charcoal hover:border-gold transition-all group">
              {!!c.badge && <span className="absolute top-3 right-3 text-[10px] bg-gradient-gold text-primary-foreground px-2 py-0.5 rounded-full font-medium">{c.badge} new</span>}
              <Icon size={20} className="text-gold mb-3" />
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">{c.label}</p>
              <p className="font-display text-4xl text-gradient-gold mt-1">{c.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="p-6 border border-gold bg-gradient-to-br from-charcoal to-onyx">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-gold" size={18} />
          <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Confirmed Revenue</p>
        </div>
        <p className="font-display text-5xl text-gradient-gold">AED {(stats?.revenue ?? 0).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-2">Sum of paid ticket orders.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-gold-soft bg-charcoal p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-xl text-ivory">Recent Bookings</p>
            <Link to="/admin/bookings" className="text-[10px] tracking-[0.3em] text-gold uppercase">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentBookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-t border-gold-soft/40 pt-3 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-ivory truncate">{b.customer_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.event_type}</p>
                </div>
                <span className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 ${b.status === "new" ? "bg-gold text-primary-foreground" : "border border-gold-soft text-gold"}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-gold-soft bg-charcoal p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-xl text-ivory">Recent Orders</p>
            <Link to="/admin/orders" className="text-[10px] tracking-[0.3em] text-gold uppercase">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between border-t border-gold-soft/40 pt-3 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-ivory truncate">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.order_reference} · ×{o.quantity}</p>
                </div>
                <p className="font-display text-gradient-gold">{o.currency} {Number(o.total_amount).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
