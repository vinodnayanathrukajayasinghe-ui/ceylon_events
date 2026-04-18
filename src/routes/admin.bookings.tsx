import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

const STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
type Status = typeof STATUSES[number];

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_type: string;
  preferred_date: string | null;
  guest_count: number | null;
  budget_range: string | null;
  message: string | null;
  status: Status;
  admin_notes: string | null;
  created_at: string;
}

function AdminBookings() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [open, setOpen] = useState<Booking | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    setItems((data || []) as Booking[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated.");
    load();
    if (open?.id === id) setOpen({ ...open, status });
  };

  const saveNotes = async () => {
    if (!open) return;
    const { error } = await supabase.from("bookings").update({ admin_notes: open.admin_notes }).eq("id", open.id);
    if (error) toast.error(error.message); else toast.success("Notes saved.");
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.4em] text-gold uppercase">Inbox</p>
        <h1 className="font-display text-4xl text-ivory mt-1">Event Bookings</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 text-[10px] tracking-[0.3em] uppercase border transition-all ${filter === s ? "bg-gradient-gold text-primary-foreground border-transparent" : "border-gold-soft text-ivory/70 hover:text-gold"}`}>
            {s} {s !== "all" && `(${items.filter((i) => i.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="text-gold animate-spin" /></div>
      ) : (
        <div className="border border-gold-soft bg-charcoal overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-onyx border-b border-gold-soft">
              <tr className="text-left text-[10px] tracking-[0.3em] text-gold uppercase">
                <th className="p-4">Customer</th>
                <th className="p-4">Event</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Received</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No bookings.</td></tr>}
              {filtered.map((b) => (
                <tr key={b.id} onClick={() => setOpen(b)} className="border-t border-gold-soft/40 hover:bg-onyx/40 cursor-pointer">
                  <td className="p-4">
                    <p className="text-ivory">{b.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{b.customer_email}</p>
                  </td>
                  <td className="p-4 text-ivory/80">{b.event_type}</td>
                  <td className="p-4 text-ivory/80">{b.preferred_date ? new Date(b.preferred_date).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="p-4"><StatusBadge status={b.status} /></td>
                  <td className="p-4 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={() => setOpen(null)}>
          <div className="bg-onyx border border-gold w-full max-w-2xl p-6 md:p-8 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Booking</p>
                <h2 className="font-display text-3xl text-ivory mt-1">{open.customer_name}</h2>
                <div className="flex flex-wrap gap-3 mt-3 text-sm">
                  <a href={`mailto:${open.customer_email}`} className="inline-flex items-center gap-1 text-gold hover:underline"><Mail size={14} /> {open.customer_email}</a>
                  <a href={`tel:${open.customer_phone}`} className="inline-flex items-center gap-1 text-gold hover:underline"><Phone size={14} /> {open.customer_phone}</a>
                </div>
              </div>
              <button onClick={() => setOpen(null)} className="text-ivory/60 hover:text-gold text-xs uppercase tracking-[0.2em]">Close</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Info label="Event Type" value={open.event_type} />
              <Info label="Preferred Date" value={open.preferred_date ? new Date(open.preferred_date).toLocaleDateString("en-GB") : "—"} />
              <Info label="Guests" value={open.guest_count ? String(open.guest_count) : "—"} />
              <Info label="Budget" value={open.budget_range || "—"} />
            </div>

            {open.message && (
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-2">Message</p>
                <p className="text-ivory/85 whitespace-pre-line bg-charcoal p-4 border border-gold-soft">{open.message}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => updateStatus(open.id, s)} className={`px-3 py-2 text-[10px] tracking-[0.3em] uppercase border ${open.status === s ? "bg-gradient-gold text-primary-foreground border-transparent" : "border-gold-soft text-ivory/70 hover:text-gold"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-2">Internal Notes</p>
              <textarea value={open.admin_notes || ""} onChange={(e) => setOpen({ ...open, admin_notes: e.target.value })} rows={3} className="w-full px-4 py-3 bg-charcoal border border-gold-soft text-ivory focus:outline-none focus:border-gold" />
              <button onClick={saveNotes} className="mt-3 px-5 py-2 bg-gradient-gold text-primary-foreground text-xs uppercase tracking-[0.2em] rounded-sm">Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    new: "bg-gradient-gold text-primary-foreground",
    contacted: "border border-gold text-gold",
    confirmed: "border border-emerald-400/60 text-emerald-300",
    completed: "border border-gold-soft text-ivory/60",
    cancelled: "border border-destructive/60 text-destructive",
  };
  return <span className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 ${map[status]}`}>{status}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold-soft bg-charcoal p-3">
      <p className="text-[10px] tracking-[0.3em] text-gold uppercase">{label}</p>
      <p className="text-ivory mt-1">{value}</p>
    </div>
  );
}
