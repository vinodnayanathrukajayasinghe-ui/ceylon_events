import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatTicketingError, issueTicketsForOrder } from "@/lib/tickets";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "paid", "failed", "refunded"] as const;
type PStatus = typeof STATUSES[number];

interface Order {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  payment_status: PStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  event_id: string;
  ticket_category_id: string;
  created_at: string;
}

function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  const [eventMap, setEventMap] = useState<Record<string, string>>({});
  const [catMap, setCatMap] = useState<Record<string, string>>({});
  const [issuedMap, setIssuedMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | PStatus>("all");
  const [ticketingError, setTicketingError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data }, ev, ct, issued] = await Promise.all([
      supabase.from("ticket_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("id,title"),
      supabase.from("ticket_categories").select("id,name"),
      (supabase as any).from("issued_tickets").select("order_id"),
    ]);
    setItems((data || []) as Order[]);
    setEventMap(Object.fromEntries((ev.data || []).map((e: any) => [e.id, e.title])));
    setCatMap(Object.fromEntries((ct.data || []).map((c: any) => [c.id, c.name])));
    setIssuedMap(
      (issued.data || []).reduce((acc: Record<string, number>, row: { order_id: string }) => {
        acc[row.order_id] = (acc[row.order_id] || 0) + 1;
        return acc;
      }, {}),
    );
    setTicketingError(
      issued.error
        ? formatTicketingError(issued.error, "Unable to load issued ticket records.")
        : null,
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (id: string, status: PStatus) => {
    const { error } = await supabase
      .from("ticket_orders")
      .update({ payment_status: status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (status === "paid") {
      try {
        await issueTicketsForOrder(id);
      } catch (issuanceError) {
        console.error("Ticket issuance sync failed", issuanceError);
        toast.error(
          issuanceError instanceof Error
            ? issuanceError.message
            : "Payment saved, but ticket issuance needs a retry.",
        );
        void load();
        return;
      }
    }

    toast.success("Order updated.");
    void load();
  };

  const filtered = filter === "all" ? items : items.filter((item) => item.payment_status === filter);
  const totalRev = filtered
    .filter((item) => item.payment_status === "paid")
    .reduce((sum, item) => sum + Number(item.total_amount), 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Sales</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">Ticket Orders</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Mark an order as <span className="text-gold">paid</span> to issue attendee-level QR
          tickets automatically. Pending or failed payments do not create valid admission.
        </p>
        {ticketingError && (
          <div className="mt-4 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {ticketingError}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`border px-4 py-2 text-[10px] uppercase tracking-[0.3em] ${
                filter === status
                  ? "border-transparent bg-gradient-gold text-primary-foreground"
                  : "border-gold-soft text-ivory/70 hover:text-gold"
              }`}
            >
              {status} {status !== "all" && `(${items.filter((item) => item.payment_status === status).length})`}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Paid in view:{" "}
          <span className="font-display text-xl text-gradient-gold">
            AED {totalRev.toLocaleString()}
          </span>
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold-soft bg-charcoal">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="border-b border-gold-soft bg-onyx">
              <tr className="text-left text-[10px] uppercase tracking-[0.3em] text-gold">
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Event / Tier</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Issued</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No orders.
                  </td>
                </tr>
              )}
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-gold-soft/40 hover:bg-onyx/40">
                  <td className="p-4 font-mono text-xs text-gold">{order.order_reference}</td>
                  <td className="p-4">
                    <p className="text-ivory">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-ivory">{eventMap[order.event_id] || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {catMap[order.ticket_category_id] || "—"}
                    </p>
                  </td>
                  <td className="p-4 text-ivory">×{order.quantity}</td>
                  <td className="p-4">
                    <span className="inline-flex rounded-full border border-gold-soft px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-ivory/75">
                      {issuedMap[order.id] || 0} / {order.quantity}
                    </span>
                  </td>
                  <td className="p-4 font-display text-gradient-gold">
                    {order.currency} {Number(order.total_amount).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.payment_status}
                      onChange={(event) => updateStatus(order.id, event.target.value as PStatus)}
                      className="border border-gold-soft bg-onyx px-2 py-1 text-xs uppercase tracking-wider text-ivory"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("en-GB")}
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
