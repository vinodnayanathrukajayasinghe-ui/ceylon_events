import { useEffect, useState } from "react";
import { Check, Loader2, Ticket } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

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

function createOrderReference() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();

  return `CKE-${random}`;
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
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ ref: string } | null>(null);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "" });

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("ticket_categories")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Failed to load ticket categories", error);
        setCats([]);
        setSelectedId("");
        setLoadError("Ticket options are taking longer than expected. Please retry in a moment.");
        setLoading(false);
        return;
      }

      const list = (data || []) as Category[];
      setCats(list);
      setSelectedId(list[0]?.id || "");
      setQty(1);
      setLoading(false);
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const selected = cats.find((category) => category.id === selectedId);
  const remaining = selected ? selected.quantity_total - selected.quantity_sold : 0;
  const total = selected ? selected.price * qty : 0;

  useEffect(() => {
    if (!selected) return;
    setQty((currentQty) => Math.max(1, Math.min(currentQty, Math.min(20, remaining || 20))));
  }, [remaining, selected, selectedId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
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

    const orderReference = createOrderReference();
    setSubmitting(true);

    const { error } = await supabase.from("ticket_orders").insert({
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
      order_reference: orderReference,
      payment_status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setDone({ ref: orderReference });
    toast.success("Order placed. We'll be in touch to confirm payment.");
  };

  if (loading) {
    return (
      <div className="grid min-h-[200px] place-items-center border border-gold-soft bg-charcoal p-8">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 animate-spin text-gold" />
          <p className="text-xs uppercase tracking-[0.25em] text-gold/80">Loading tickets</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="border border-gold bg-gradient-to-b from-charcoal to-onyx p-8 text-center">
        <Ticket className="mx-auto mb-3 text-gold" size={28} />
        <p className="mb-2 font-display text-2xl text-ivory">Ticket Loading Issue</p>
        <p className="mb-5 text-sm text-muted-foreground">{loadError}</p>
        <Link
          to="/contact"
          className="inline-block border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold hover:text-primary-foreground"
        >
          Contact Concierge
        </Link>
      </div>
    );
  }

  if (!cats.length) {
    return (
      <div className="border border-gold bg-gradient-to-b from-charcoal to-onyx p-8 text-center">
        <Ticket className="mx-auto mb-3 text-gold" size={28} />
        <p className="mb-2 font-display text-2xl text-ivory">Tickets Coming Soon</p>
        <p className="mb-5 text-sm text-muted-foreground">
          Reserve your seat by enquiring directly with our team.
        </p>
        <Link
          to="/contact"
          className="inline-block border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold hover:text-primary-foreground"
        >
          Enquire Now
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="border border-gold bg-gradient-to-b from-charcoal to-onyx p-8 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gradient-gold">
          <Check className="text-primary-foreground" size={26} />
        </div>
        <p className="mb-1 font-display text-2xl text-ivory">Order Received</p>
        <p className="mb-4 text-xs text-muted-foreground">Reference</p>
        <p className="mb-5 font-display text-2xl tracking-wider text-gradient-gold">{done.ref}</p>
        <p className="mb-6 text-sm text-ivory/80">
          Our concierge will contact you within 24 hours to confirm payment and deliver tickets.
        </p>
        <Link
          to="/my-bookings"
          className="inline-block rounded-sm bg-gradient-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 border border-gold bg-gradient-to-b from-charcoal to-onyx p-8"
    >
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-gold">Select Tier</p>
        <div className="space-y-2">
          {cats.map((category) => {
            const left = category.quantity_total - category.quantity_sold;
            const soldOut = left <= 0;

            return (
              <button
                type="button"
                key={category.id}
                onClick={() => !soldOut && setSelectedId(category.id)}
                disabled={soldOut}
                className={`w-full border p-4 text-left transition-all ${
                  selectedId === category.id
                    ? "border-gold bg-onyx shadow-gold"
                    : "border-gold-soft hover:border-gold/60"
                } ${soldOut ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-lg text-ivory">{category.name}</p>
                  <p className="font-display text-xl text-gradient-gold">
                    {currency} {category.price}
                  </p>
                </div>
                {category.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                )}
                <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gold/70">
                  {soldOut ? "Sold Out" : `${left} remaining`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.4em] text-gold">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="size-10 border border-gold-soft text-gold hover:border-gold"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={Math.min(20, remaining || 20)}
            value={qty}
            onChange={(event) =>
              setQty(Math.max(1, Math.min(Math.min(20, remaining || 20), Number(event.target.value) || 1)))
            }
            className="h-10 w-16 border border-gold-soft bg-onyx text-center font-display text-lg text-ivory focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQty(Math.min(Math.min(20, remaining || 20), qty + 1))}
            className="size-10 border border-gold-soft text-gold hover:border-gold"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <input
          required
          placeholder="Full Name"
          value={form.customer_name}
          onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
          className="border border-gold-soft bg-onyx px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.customer_email}
          onChange={(event) => setForm({ ...form, customer_email: event.target.value })}
          className="border border-gold-soft bg-onyx px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
        <input
          required
          type="tel"
          placeholder="WhatsApp / Phone"
          value={form.customer_phone}
          onChange={(event) => setForm({ ...form, customer_phone: event.target.value })}
          className="border border-gold-soft bg-onyx px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
      </div>

      <div className="flex items-baseline justify-between border-t border-gold-soft pt-5">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Total</p>
        <p className="font-display text-3xl text-gradient-gold">
          {currency} {total.toLocaleString()}
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || !selected || remaining <= 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-gold py-4 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-all hover:shadow-gold-lg disabled:opacity-50"
      >
        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Ticket size={14} />}
        Reserve {qty} Ticket{qty > 1 ? "s" : ""} - {eventTitle}
      </button>
      <p className="text-center text-[10px] tracking-wider text-muted-foreground">
        Payment confirmation is handled by our concierge after reservation.
      </p>
    </form>
  );
}
