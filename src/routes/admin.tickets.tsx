import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { IssuedTicketRecord, TicketVerificationStatus } from "@/lib/tickets";
import { buildTicketOwnerUrl } from "@/lib/tickets";

export const Route = createFileRoute("/admin/tickets")({
  component: AdminTicketsPage,
});

function AdminTicketsPage() {
  const [tickets, setTickets] = useState<IssuedTicketRecord[]>([]);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TicketVerificationStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | string>("all");

  const load = async () => {
    setLoading(true);

    const [ticketsResult, eventsResult] = await Promise.all([
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
      supabase.from("events").select("id, title").order("event_date", { ascending: true }),
    ]);

    setTickets((ticketsResult.data || []) as IssuedTicketRecord[]);
    setEvents((eventsResult.data || []) as Array<{ id: string; title: string }>);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesQuery =
        !q ||
        ticket.ticket_code.toLowerCase().includes(q) ||
        ticket.attendee_name.toLowerCase().includes(q) ||
        ticket.purchaser_name.toLowerCase().includes(q) ||
        ticket.purchaser_email.toLowerCase().includes(q) ||
        (ticket.ticket_orders?.order_reference || "").toLowerCase().includes(q);

      const matchesEvent = eventFilter === "all" || ticket.event_id === eventFilter;
      const matchesStatus =
        statusFilter === "all" || ticket.verification_status === statusFilter;
      const matchesPayment =
        paymentFilter === "all" || ticket.payment_status === paymentFilter;

      return matchesQuery && matchesEvent && matchesStatus && matchesPayment;
    });
  }, [eventFilter, paymentFilter, query, statusFilter, tickets]);

  const toggleCancel = async (ticket: IssuedTicketRecord) => {
    const nextCancelled = !ticket.is_cancelled;
    const nextStatus: TicketVerificationStatus = nextCancelled
      ? "cancelled"
      : ticket.is_used
        ? "used"
        : ticket.payment_status === "paid"
          ? "unused"
          : "pending_payment";

    const { error } = await (supabase as any)
      .from("issued_tickets")
      .update({
        is_cancelled: nextCancelled,
        verification_status: nextStatus,
      })
      .eq("id", ticket.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(nextCancelled ? "Ticket cancelled." : "Ticket reactivated.");
    void load();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Issued Tickets</p>
        <h1 className="mt-2 font-display text-4xl text-ivory">Ticket Vault</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Search any issued ticket, validate ownership, cancel compromised entries, and copy secure
          ticket links for customer support.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-gold-soft bg-charcoal p-5 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by ticket code, order ref, attendee or email"
          className="border border-gold-soft bg-onyx px-4 py-3 text-sm text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />

        <select
          value={eventFilter}
          onChange={(event) => setEventFilter(event.target.value)}
          className="border border-gold-soft bg-onyx px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
        >
          <option value="all">All events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | TicketVerificationStatus)}
          className="border border-gold-soft bg-onyx px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
        >
          <option value="all">All verification states</option>
          <option value="unused">Unused</option>
          <option value="used">Used</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending_payment">Pending payment</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          className="border border-gold-soft bg-onyx px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
        >
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold-soft bg-charcoal">
          <table className="min-w-[1180px] w-full text-sm">
            <thead className="border-b border-gold-soft bg-onyx">
              <tr className="text-left text-[10px] uppercase tracking-[0.3em] text-gold">
                <th className="p-4">Ticket</th>
                <th className="p-4">Attendee</th>
                <th className="p-4">Event</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Check-Ins</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No issued tickets match the current filters.
                  </td>
                </tr>
              )}
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="border-t border-gold-soft/40 align-top hover:bg-onyx/40">
                  <td className="p-4">
                    <p className="font-body text-xs font-semibold tracking-[0.18em] text-gold-bright">
                      {ticket.ticket_code}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticket.ticket_orders?.order_reference}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-ivory">{ticket.attendee_name}</p>
                    <p className="text-xs text-muted-foreground">{ticket.attendee_email || "No attendee email"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Purchaser: {ticket.purchaser_name}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-ivory">{ticket.events?.title}</p>
                    <p className="text-xs text-muted-foreground">{ticket.ticket_categories?.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ivory/55">
                      {ticket.events?.event_date &&
                        new Date(ticket.events.event_date).toLocaleDateString("en-GB")}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em] ${
                        ticket.payment_status === "paid"
                          ? "border-gold text-gold"
                          : "border-ivory/15 text-ivory/70"
                      }`}
                    >
                      {ticket.payment_status}
                    </span>
                    <p className="mt-2 font-display text-xl text-gradient-gold">
                      {ticket.currency} {Number(ticket.unit_price).toLocaleString()}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em] ${
                        ticket.verification_status === "unused"
                          ? "border-gold text-gold"
                          : ticket.verification_status === "used"
                            ? "border-amber-400/50 text-amber-200"
                            : ticket.verification_status === "cancelled"
                              ? "border-red-500/50 text-red-300"
                              : "border-ivory/15 text-ivory/70"
                      }`}
                    >
                      {ticket.verification_status.replace("_", " ")}
                    </span>
                    {ticket.checked_in_at && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Used {new Date(ticket.checked_in_at).toLocaleString("en-GB")}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-sm text-ivory">
                    {ticket.ticket_checkins?.length || 0}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/admin/verify"
                        search={{ token: ticket.qr_token } as never}
                        className="inline-flex items-center gap-2 rounded-sm border border-gold-soft px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-ivory/80 transition-all hover:border-gold hover:text-gold"
                      >
                        <ShieldCheck size={12} />
                        Verify
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(buildTicketOwnerUrl(ticket.ticket_code));
                          toast.success("Secure ticket link copied.");
                        }}
                        className="inline-flex items-center gap-2 rounded-sm border border-gold-soft px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-ivory/80 transition-all hover:border-gold hover:text-gold"
                      >
                        <Copy size={12} />
                        Copy Link
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleCancel(ticket)}
                        className="inline-flex items-center gap-2 rounded-sm border border-gold-soft px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-ivory/80 transition-all hover:border-red-500/40 hover:text-red-300"
                      >
                        {ticket.is_cancelled ? "Reactivate" : "Void Ticket"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
