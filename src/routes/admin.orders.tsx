import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | PStatus>("all");

  const load = async () => {
    setLoading(true);
    const [{ data }, ev, ct] = await Promise.all([
      supabase.from("ticket_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("id,title"),
      supabase.from("ticket_categories").select("id,name"),
    ]);
    setItems((data || []) as Order[]);
    setEventMap(Object.fromEntries((ev.data || []).map((e: any) => [e.id, e.title])));
    setCatMap(Object.fromEntries((ct.data || []).map((c: any) => [c.id, c.name])));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: PStatus) => {
    const { error } = await supabase.from("ticket_orders").update({ payment_status: status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Order updated.");
    load();
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.payment_status === filter);
  const totalRev = filtered.filter((i) => i.payment_status === "paid").reduce((s, i) => s + Number(i.total_amount), 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.4em] text-gold uppercase">Sales</p>
        <h1 className="font-display text-4xl text-ivory mt-1">Ticket Orders</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 text-[10px] tracking-[0.3em] uppercase border ${filter === s ? "bg-gradient-gold text-primary-foreground border-transparent" : "border-gold-soft text-ivory/70 hover:text-gold"}`}>
              {s} {s !== "all" && `(${items.filter((i) => i.payment_status === s).length})`}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Paid in view: <span className="font-display text-gradient-gold text-xl">AED {totalRev.toLocaleString()}</span></p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="text-gold animate-spin" /></div>
      ) : (
        <div className="border border-gold-soft bg-charcoal overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-onyx border-b border-gold-soft">
              <tr className="text-left text-[10px] tracking-[0.3em] text-gold uppercase">
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Event / Tier</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders.</td></tr>}
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-gold-soft/40 hover:bg-onyx/40">
                  <td className="p-4 font-mono text-xs text-gold">{o.order_reference}</td>
                  <td className="p-4">
                    <p className="text-ivory">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-ivory">{eventMap[o.event_id] || "—"}</p>
                    <p className="text-xs text-muted-foreground">{catMap[o.ticket_category_id] || "—"}</p>
                  </td>
                  <td className="p-4 text-ivory">×{o.quantity}</td>
                  <td className="p-4 font-display text-gradient-gold">{o.currency} {Number(o.total_amount).toLocaleString()}</td>
                  <td className="p-4">
                    <select value={o.payment_status} onChange={(e) => updateStatus(o.id, e.target.value as PStatus)} className="bg-onyx border border-gold-soft text-ivory text-xs px-2 py-1 uppercase tracking-wider">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
