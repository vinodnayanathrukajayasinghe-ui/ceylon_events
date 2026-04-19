import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, LogOut, Ticket } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Ceylon Kandy Events" },
      { name: "description", content: "View your bookings and ticket orders." },
    ],
  }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    // RLS now allows match by user_id OR matching email — fetch everything tied to this user
    supabase
      .from("bookings")
      .select("*")
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings(data ?? []));
    supabase
      .from("ticket_orders")
      .select("*, events(title, event_date, venue)")
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, [user]);

  if (loading || !user) {
    return (
      <SiteLayout>
        <div className="container-luxe py-32 text-center text-muted-foreground">Loading...</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-24 pb-12">
        <div className="container-luxe flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.5em] text-gold uppercase mb-4">Member Area</p>
            <h1 className="font-display text-5xl md:text-6xl text-ivory">My <span className="text-gradient-gold italic">Bookings</span></h1>
            <p className="mt-3 text-muted-foreground">{user.email}</p>
          </div>
          <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="inline-flex items-center gap-2 px-5 py-3 border border-gold-soft text-ivory uppercase tracking-[0.2em] text-xs hover:border-gold hover:text-gold transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </section>

      <section className="py-12">
        <div className="container-luxe">
          <h2 className="font-display text-3xl text-ivory mb-6 flex items-center gap-3"><Calendar className="text-gold" size={22} /> Event Bookings</h2>
          {bookings.length === 0 ? (
            <div className="border border-gold-soft bg-charcoal p-10 text-center text-muted-foreground">
              No bookings yet. <Link to="/book" className="text-gold underline ml-2">Book an event</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="border border-gold-soft bg-charcoal p-6 flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl text-ivory">{b.event_type}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {b.preferred_date && new Date(b.preferred_date).toLocaleDateString("en-GB")} · {b.guest_count ?? "—"} guests · {b.budget_range ?? "—"}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase rounded-sm border ${
                    b.status === "confirmed" ? "border-gold text-gold" :
                    b.status === "completed" ? "border-gold-soft text-ivory/60" :
                    b.status === "cancelled" ? "border-destructive/50 text-destructive" :
                    "border-gold-soft text-ivory/80"
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 pb-32">
        <div className="container-luxe">
          <h2 className="font-display text-3xl text-ivory mb-6 flex items-center gap-3"><Ticket className="text-gold" size={22} /> Ticket Orders</h2>
          {orders.length === 0 ? (
            <div className="border border-gold-soft bg-charcoal p-10 text-center text-muted-foreground">
              No tickets yet. <Link to="/tickets" className="text-gold underline ml-2">Browse events</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border border-gold-soft bg-charcoal p-6 flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-1">{o.order_reference}</p>
                    <h3 className="font-display text-xl text-ivory">{o.events?.title ?? "Event"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{o.quantity} × {o.currency} {o.unit_price} = {o.currency} {o.total_amount}</p>
                  </div>
                  <span className={`px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase rounded-sm border ${
                    o.payment_status === "paid" ? "border-gold text-gold" : "border-gold-soft text-ivory/70"
                  }`}>{o.payment_status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
