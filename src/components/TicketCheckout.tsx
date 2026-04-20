import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Ticket, Users } from "lucide-react";
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

interface AttendeeForm {
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
}

interface Props {
  eventId: string;
  eventTitle: string;
  currency: string;
  fallbackCategories?: Category[];
}

const MAX_QTY = 12;

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("en-US");
}

function createOrderReference() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();

  return `CKE-${random}`;
}

function createOrderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(16).slice(2).padEnd(32, "0");
  return `${random.slice(0, 8)}-${random.slice(8, 12)}-${random.slice(12, 16)}-${random.slice(16, 20)}-${random.slice(20, 32)}`;
}

const schema = z.object({
  customer_name: z.string().trim().min(2, "Purchaser name is required").max(100),
  customer_email: z.string().trim().email("Enter a valid purchaser email").max(255),
  customer_phone: z.string().trim().min(7, "Purchaser phone is required").max(30),
  quantity: z.number().int().min(1).max(MAX_QTY),
});

export function TicketCheckout({ eventId, eventTitle, currency, fallbackCategories = [] }: Props) {
  const { user } = useAuth();
  const [cats, setCats] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(fallbackCategories.length === 0);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(fallbackCategories[0]?.id || "");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ ref: string; orderId: string } | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
  });
  const [attendees, setAttendees] = useState<AttendeeForm[]>([
    { attendee_name: "", attendee_email: "", attendee_phone: "" },
  ]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      if (!fallbackCategories.length) {
        setLoading(true);
      }
      setLoadError("");

      const { data, error } = await supabase
        .from("ticket_categories")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Failed to load ticket categories", error);
        if (!fallbackCategories.length) {
          setCats([]);
          setSelectedId("");
          setLoadError("Ticket options are taking longer than expected. Please retry in a moment.");
        }
        setLoading(false);
        return;
      }

      const list = (data || []) as Category[];
      setCats(list.length ? list : fallbackCategories);
      setSelectedId(list[0]?.id || fallbackCategories[0]?.id || "");
      setQty(1);
      setLoading(false);
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, [eventId, fallbackCategories]);

  useEffect(() => {
    setAttendees((current) =>
      Array.from({ length: qty }, (_, index) => {
        const existing = current[index];
        if (existing) return existing;

        return {
          attendee_name: index === 0 ? form.customer_name : "",
          attendee_email: index === 0 ? form.customer_email : "",
          attendee_phone: index === 0 ? form.customer_phone : "",
        };
      }),
    );
  }, [qty, form.customer_email, form.customer_name, form.customer_phone]);

  const selected = cats.find((category) => category.id === selectedId);
  const remaining = selected ? selected.quantity_total - selected.quantity_sold : 0;
  const total = selected ? selected.price * qty : 0;

  useEffect(() => {
    if (!selected) return;
    setQty((currentQty) => Math.max(1, Math.min(currentQty, Math.min(MAX_QTY, remaining || MAX_QTY))));
  }, [remaining, selected]);

  const attendeeErrors = useMemo(() => {
    return attendees.map((attendee, index) => {
      if (index >= qty) return "";
      if (!attendee.attendee_name.trim()) return "Attendee name is required";
      if (attendee.attendee_name.trim().length < 2) return "Attendee name is too short";
      if (attendee.attendee_email && !z.string().email().safeParse(attendee.attendee_email).success) {
        return "Attendee email is invalid";
      }
      return "";
    });
  }, [attendees, qty]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;

    const parsed = schema.safeParse({ ...form, quantity: qty });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    const attendeeError = attendeeErrors.find(Boolean);
    if (attendeeError) {
      toast.error(attendeeError);
      return;
    }

    if (qty > remaining) {
      toast.error(`Only ${remaining} tickets remaining in this tier.`);
      return;
    }

    const orderId = createOrderId();
    const orderReference = createOrderReference();
    setSubmitting(true);

    const { error: orderError } = await supabase.from("ticket_orders").insert({
      id: orderId,
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
      payment_provider: "manual",
    });

    if (orderError) {
      setSubmitting(false);
      toast.error(orderError.message);
      return;
    }

    const attendeeRows = attendees.slice(0, qty).map((attendee, index) => ({
      order_id: orderId,
      ticket_category_id: selected.id,
      attendee_index: index + 1,
      attendee_name: attendee.attendee_name.trim(),
      attendee_email: attendee.attendee_email.trim() || form.customer_email.trim(),
      attendee_phone: attendee.attendee_phone.trim() || form.customer_phone.trim(),
    }));

    const { error: attendeeErrorInsert } = await (supabase as any)
      .from("ticket_order_attendees")
      .insert(attendeeRows);

    setSubmitting(false);

    if (attendeeErrorInsert) {
      console.error("Attendee assignment fallback engaged", attendeeErrorInsert);
      toast.warning("Order saved. Attendee details will be completed from the purchaser record.");
    } else {
      toast.success("Reservation received. Payment verification is now pending.");
    }

    setDone({ ref: orderReference, orderId });
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
        <p className="mb-1 font-display text-2xl text-ivory">Reservation Received</p>
        <p className="mb-4 text-xs text-muted-foreground">Booking Reference</p>
        <p className="mb-5 font-display text-2xl tracking-wider text-gradient-gold">{done.ref}</p>
        <p className="mb-3 text-sm text-ivory/80">
          The reservation is stored with attendee details and awaits confirmed payment.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Once payment is marked as paid, official QR tickets will be issued automatically to your booking.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/my-bookings"
            className="inline-block rounded-sm bg-gradient-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground"
          >
            View My Orders
          </Link>
          <Link
            to="/tickets"
            className="inline-block rounded-sm border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold"
          >
            Browse More Events
          </Link>
        </div>
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
                  <p className="price-display price-display--compact">
                    <span className="price-currency">{currency}</span>
                    <span className="price-value">{formatPrice(category.price)}</span>
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
            max={Math.min(MAX_QTY, remaining || MAX_QTY)}
            value={qty}
            onChange={(event) =>
              setQty(
                Math.max(
                  1,
                  Math.min(
                    Math.min(MAX_QTY, remaining || MAX_QTY),
                    Number(event.target.value) || 1,
                  ),
                ),
              )
            }
            className="h-10 w-16 border border-gold-soft bg-onyx text-center font-display text-lg text-ivory focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQty(Math.min(Math.min(MAX_QTY, remaining || MAX_QTY), qty + 1))}
            className="size-10 border border-gold-soft text-gold hover:border-gold"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-gold">Purchaser Details</p>
          <p className="mb-3 text-sm text-muted-foreground">
            This contact receives payment updates and owns the order.
          </p>
        </div>
        <input
          required
          placeholder="Purchaser Full Name"
          value={form.customer_name}
          onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
          className="border border-gold-soft bg-onyx px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="Purchaser Email"
          value={form.customer_email}
          onChange={(event) => setForm({ ...form, customer_email: event.target.value })}
          className="border border-gold-soft bg-onyx px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
        <input
          required
          type="tel"
          placeholder="Purchaser WhatsApp / Phone"
          value={form.customer_phone}
          onChange={(event) => setForm({ ...form, customer_phone: event.target.value })}
          className="border border-gold-soft bg-onyx px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-gold-soft/70 bg-black/20 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full border border-gold-soft bg-onyx text-gold">
            <Users size={16} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Attendee Assignment</p>
            <p className="text-sm text-muted-foreground">
              Each attendee receives an individual QR ticket after payment is confirmed.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {attendees.slice(0, qty).map((attendee, index) => (
            <div key={index} className="rounded-2xl border border-gold-soft/40 bg-onyx/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-gold">
                  Ticket {index + 1}
                </p>
                {attendeeErrors[index] && (
                  <span className="text-[11px] text-red-300">{attendeeErrors[index]}</span>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  required
                  placeholder="Attendee Full Name"
                  value={attendee.attendee_name}
                  onChange={(event) =>
                    setAttendees((current) =>
                      current.map((item, attendeeIndex) =>
                        attendeeIndex === index
                          ? { ...item, attendee_name: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="border border-gold-soft bg-black/20 px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Attendee Email (optional)"
                  value={attendee.attendee_email}
                  onChange={(event) =>
                    setAttendees((current) =>
                      current.map((item, attendeeIndex) =>
                        attendeeIndex === index
                          ? { ...item, attendee_email: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="border border-gold-soft bg-black/20 px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Attendee Phone (optional)"
                  value={attendee.attendee_phone}
                  onChange={(event) =>
                    setAttendees((current) =>
                      current.map((item, attendeeIndex) =>
                        attendeeIndex === index
                          ? { ...item, attendee_phone: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="border border-gold-soft bg-black/20 px-4 py-3 text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none md:col-span-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between border-t border-gold-soft pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Total</p>
          <p className="mt-2 text-xs text-muted-foreground">
            QR tickets are issued only after payment status becomes paid.
          </p>
        </div>
        <p className="price-display price-display--card">
          <span className="price-currency">{currency}</span>
          <span className="price-value">{formatPrice(total)}</span>
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
        Ticket issuance, QR validation, and check-in activate only after confirmed payment.
      </p>
    </form>
  );
}
