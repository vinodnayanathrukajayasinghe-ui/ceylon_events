import { useEffect, useState } from "react";
import { Loader2, Ticket, Check } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";

interface Category {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_total: number;
  quantity_sold: number;
}

interface Props {
  eventId: string;
  eventTitle: string;
  currency: string;
}

const schema = z.object({
  customer_name: z.string().trim().min(2, "Name required").max(100),
  customer_email: z.string().trim().email("Invalid email").max(255),
  customer_phone: z.string().trim().min(7, "Phone required").max(30),
  quantity: z.number().int().min(1).max(20),
});

export function TicketCheckout({ eventId, eventTitle, currency }: Props) {
  const { user } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "" });

  useEffect(() => {
    supabase
      .from("ticket_categories")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const list = (data || []) as Category[];
        setCats(list);
        if (list.length) setSelectedId(list[0].id);
        setLoading(false);
      });
  }, [eventId]);

  const selected = cats.find((c) => c.id === selectedId);
  const remaining = selected ? selected.quantity_total - selected.quantity_sold : 0;
  const total = selected ? selected.price * qty : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const parsed = schema.safeParse({ ...form, quantity: qty });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }
    if (qty > remaining) {
      toast.error(`Only ${remaining} tickets remaining in this tier.`);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("ticket_orders")
      .insert({
        event_id: eventId,
        ticket_category_id: selected.id,
        user_id: user?.id ?? null,
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_phone: form.customer_phone.trim(),
        quantity: qty,
        unit_price: selected.price,
        total_amount: selected.price * qty,
        currency,
        payment_status: "pending",
      })
      .select("order_reference")
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone({ ref: data.order_reference });
    toast.success("Order placed. We'll be in touch to confirm payment.");
  };

  if (loading) {
    return (
      <div className="border border-gold-soft p-8 bg-charcoal grid place-items-center min-h-[200px]">
        <Loader2 className="text-gold animate-spin" />
      </div>
    );
  }

  if (!cats.length) {
    return (
      <div className="border border-gold p-8 bg-gradient-to-b from-charcoal to-onyx text-center">
        <Ticket className="text-gold mx-auto mb-3" size={28} />
        <p className="font-display text-2xl text-ivory mb-2">Tickets Coming Soon</p>
        <p className="text-sm text-muted-foreground mb-5">Reserve your seat by enquiring directly with our team.</p>
        <Link to="/contact" className="inline-block px-6 py-3 border border-gold text-gold uppercase tracking-[0.2em] text-xs hover:bg-gold hover:text-primary-foreground transition-all">
          Enquire Now
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="border border-gold p-8 bg-gradient-to-b from-charcoal to-onyx text-center">
        <div className="size-14 rounded-full bg-gradient-gold mx-auto grid place-items-center mb-4">
          <Check className="text-primary-foreground" size={26} />
        </div>
        <p className="font-display text-2xl text-ivory mb-1">Order Received</p>
        <p className="text-xs text-muted-foreground mb-4">Reference</p>
        <p className="font-display text-2xl text-gradient-gold tracking-wider mb-5">{done.ref}</p>
        <p className="text-sm text-ivory/80 mb-6">Our concierge will contact you within 24 hours to confirm payment & deliver tickets.</p>
        <Link to="/my-bookings" className="inline-block px-6 py-3 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs rounded-sm">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-gold p-8 bg-gradient-to-b from-charcoal to-onyx space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.4em] text-gold uppercase mb-3">Select Tier</p>
        <div className="space-y-2">
          {cats.map((c) => {
            const left = c.quantity_total - c.quantity_sold;
            const out = left <= 0;
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => !out && setSelectedId(c.id)}
                disabled={out}
                className={`w-full text-left p-4 border transition-all ${
                  selectedId === c.id
                    ? "border-gold bg-onyx shadow-gold"
                    : "border-gold-soft hover:border-gold/60"
                } ${out ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-lg text-ivory">{c.name}</p>
                  <p className="font-display text-xl text-gradient-gold">{currency} {c.price}</p>
                </div>
                {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                <p className="text-[10px] tracking-[0.3em] uppercase mt-2 text-gold/70">
                  {out ? "Sold Out" : `${left} remaining`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] tracking-[0.4em] text-gold uppercase mb-2">Quantity</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="size-10 border border-gold-soft text-gold hover:border-gold">−</button>
          <input
            type="number"
            min={1}
            max={Math.min(20, remaining || 20)}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className="w-16 h-10 bg-onyx border border-gold-soft text-ivory text-center font-display text-lg focus:outline-none focus:border-gold"
          />
          <button type="button" onClick={() => setQty(Math.min(20, remaining, qty + 1))} className="size-10 border border-gold-soft text-gold hover:border-gold">+</button>
        </div>
      </div>

      <div className="grid gap-3">
        <input required placeholder="Full Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="px-4 py-3 bg-onyx border border-gold-soft text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        <input required type="email" placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="px-4 py-3 bg-onyx border border-gold-soft text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
        <input required type="tel" placeholder="WhatsApp / Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="px-4 py-3 bg-onyx border border-gold-soft text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
      </div>

      <div className="border-t border-gold-soft pt-5 flex items-baseline justify-between">
        <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Total</p>
        <p className="font-display text-3xl text-gradient-gold">{currency} {total.toLocaleString()}</p>
      </div>

      <button
        type="submit"
        disabled={submitting || !selected || remaining <= 0}
        className="w-full py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:shadow-gold-lg transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Ticket size={14} />}
        Reserve {qty} Ticket{qty > 1 ? "s" : ""} — {eventTitle}
      </button>
      <p className="text-[10px] text-muted-foreground text-center tracking-wider">
        Payment confirmation is handled by our concierge after reservation.
      </p>
    </form>
  );
}
