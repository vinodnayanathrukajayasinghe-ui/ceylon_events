import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, LogOut, ReceiptText, Ticket } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { DigitalTicketCard } from "@/components/DigitalTicketCard";
import type { IssuedTicketRecord } from "@/lib/tickets";

interface BookingRecord {
  id: string;
  event_type: string;
  preferred_date: string | null;
  guest_count: number | null;
  budget_range: string | null;
  status: string;
}

interface OrderRecord {
  id: string;
  order_reference: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  payment_status: string;
  created_at: string;
  events?: {
    title?: string;
    event_date?: string;
    venue?: string;
  } | null;
}

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings - Ceylon Kandy Events" },
      { name: "description", content: "View your private event bookings, orders, and issued QR tickets." },
    ],
  }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [issuedTickets, setIssuedTickets] = useState<IssuedTicketRecord[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    setPageLoading(true);

    void Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
        .order("created_at", { ascending: false }),
      supabase
        .from("ticket_orders")
        .select("*, events(title, event_date, venue)")
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("issued_tickets")
        .select(
          `
            *,
            events(id, slug, title, event_date, event_time, venue),
            ticket_categories(id, name),
            ticket_orders(order_reference, created_at),
            ticket_checkins(checked_in_at, source)
          `,
        )
        .order("created_at", { ascending: false }),
    ]).then(([bookingsResult, ordersResult, ticketsResult]) => {
      setBookings((bookingsResult.data || []) as BookingRecord[]);
      setOrders((ordersResult.data || []) as OrderRecord[]);
      setIssuedTickets((ticketsResult.data || []) as IssuedTicketRecord[]);
      setPageLoading(false);
    });
  }, [user]);

  if (loading || !user || pageLoading) {
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
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-gold">Member Area</p>
            <h1 className="font-display text-5xl text-ivory md:text-6xl">
              My <span className="text-gradient-gold italic">Bookings</span>
            </h1>
            <p className="mt-3 text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-2 border border-gold-soft px-5 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-all hover:border-gold hover:text-gold"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </section>

      <section className="py-12">
        <div className="container-luxe">
          <div className="mb-6 flex items-center gap-3">
            <Ticket className="text-gold" size={22} />
            <h2 className="font-display text-3xl text-ivory">Issued QR Tickets</h2>
          </div>

          {issuedTickets.length === 0 ? (
            <div className="border border-gold-soft bg-charcoal p-10 text-center text-muted-foreground">
              No tickets have been issued yet. Paid orders will appear here automatically with QR verification.
            </div>
          ) : (
            <div className="space-y-6">
              {issuedTickets.map((ticket) => (
                <DigitalTicketCard key={ticket.id} ticket={ticket} compact />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container-luxe">
          <div className="mb-6 flex items-center gap-3">
            <ReceiptText className="text-gold" size={22} />
            <h2 className="font-display text-3xl text-ivory">Ticket Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="border border-gold-soft bg-charcoal p-10 text-center text-muted-foreground">
              No ticket orders yet.
              <Link to="/tickets" className="ml-2 text-gold underline">
                Browse events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap justify-between gap-4 border border-gold-soft bg-charcoal p-6"
                >
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gold">
                      {order.order_reference}
                    </p>
                    <h3 className="font-display text-2xl text-ivory">
                      {order.events?.title ?? "Event Order"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.quantity} ticket{order.quantity > 1 ? "s" : ""} · {order.currency}{" "}
                      {Number(order.total_amount).toLocaleString()}
                    </p>
                    {order.events?.event_date && (
                      <p className="mt-2 text-xs uppercase tracking-[0.26em] text-ivory/55">
                        {new Date(order.events.event_date).toLocaleDateString("en-GB")} · {order.events?.venue}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.3em] ${
                        order.payment_status === "paid"
                          ? "border-gold text-gold"
                          : order.payment_status === "pending"
                            ? "border-ivory/20 text-ivory/70"
                            : "border-red-500/40 text-red-300"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Ordered {new Date(order.created_at).toLocaleString("en-GB")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 pb-32">
        <div className="container-luxe">
          <div className="mb-6 flex items-center gap-3">
            <Calendar className="text-gold" size={22} />
            <h2 className="font-display text-3xl text-ivory">Event Bookings</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="border border-gold-soft bg-charcoal p-10 text-center text-muted-foreground">
              No private event bookings yet.
              <Link to="/book" className="ml-2 text-gold underline">
                Book an event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap justify-between gap-4 border border-gold-soft bg-charcoal p-6"
                >
                  <div>
                    <h3 className="font-display text-xl text-ivory">{booking.event_type}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.preferred_date &&
                        new Date(booking.preferred_date).toLocaleDateString("en-GB")}{" "}
                      · {booking.guest_count ?? "—"} guests · {booking.budget_range ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`rounded-sm border px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] ${
                      booking.status === "confirmed"
                        ? "border-gold text-gold"
                        : booking.status === "completed"
                          ? "border-gold-soft text-ivory/60"
                          : booking.status === "cancelled"
                            ? "border-destructive/50 text-destructive"
                            : "border-gold-soft text-ivory/80"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
