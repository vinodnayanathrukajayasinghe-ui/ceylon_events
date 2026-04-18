import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Private Event — Ceylon Kandy Events Dubai" },
      { name: "description", content: "Request a bespoke proposal for your luxury wedding, gala, brand launch or private celebration in Dubai." },
      { property: "og:title", content: "Book a Private Event — Ceylon Kandy Events" },
      { property: "og:description", content: "Begin a private conversation with Dubai's premier luxury events house." },
    ],
  }),
  component: BookPage,
});

const EVENT_TYPES = ["Corporate Gala", "Wedding", "Private Party", "Brand Launch", "Concert", "Conference", "Other"];
const BUDGETS = ["Under AED 50K", "AED 50K – 150K", "AED 150K – 500K", "AED 500K – 1M", "Above AED 1M"];

function BookPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    event_type: "",
    preferred_date: "",
    guest_count: "",
    budget_range: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    message: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      event_type: form.event_type,
      preferred_date: form.preferred_date || null,
      guest_count: form.guest_count ? Number(form.guest_count) : null,
      budget_range: form.budget_range || null,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      message: form.message || null,
      user_id: user?.id ?? null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <SiteLayout>
        <div className="container-luxe py-32 text-center max-w-xl mx-auto">
          <CheckCircle2 size={56} className="text-gold mx-auto mb-6" />
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-4">Request Received</p>
          <h1 className="font-display text-5xl md:text-6xl text-gradient-gold leading-tight">Thank you.</h1>
          <p className="mt-6 text-lg text-ivory/80 leading-relaxed">
            Our event concierge will reach you within 24 hours to begin a private conversation.
          </p>
          <a href="/" className="mt-10 inline-block px-8 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs rounded-sm">
            Return Home
          </a>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-24 pb-12 text-center container-luxe">
        <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">Begin Your Story</p>
        <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
          Book a <span className="text-gradient-gold italic">Private Event</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Share a few details. Our concierge will personally respond within 24 hours.
        </p>
      </section>

      <section className="pb-24">
        <div className="container-luxe max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`size-10 grid place-items-center rounded-full border ${step >= s ? "bg-gradient-gold border-transparent text-primary-foreground" : "border-gold-soft text-ivory/50"} font-display text-sm`}>{s}</div>
                {s < 3 && <div className={`w-12 h-px ${step > s ? "bg-gold" : "bg-gold-soft/40"}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border border-gold-soft bg-charcoal p-8 md:p-12">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <SectionHeading title="The Event" align="left" />
                <div>
                  <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Event Type</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {EVENT_TYPES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => update("event_type", t)}
                        className={`px-4 py-3 text-left text-sm border transition-all ${form.event_type === t ? "border-gold bg-onyx text-gold" : "border-gold-soft text-ivory/70 hover:border-gold/60"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Preferred Date</label>
                    <input type="date" value={form.preferred_date} onChange={(e) => update("preferred_date", e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Guest Count</label>
                    <input type="number" min={1} value={form.guest_count} onChange={(e) => update("guest_count", e.target.value)} placeholder="e.g. 200" className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                  </div>
                </div>
                <button type="button" disabled={!form.event_type} onClick={() => setStep(2)} className="w-full py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <SectionHeading title="Investment" align="left" />
                <div>
                  <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Budget Range</label>
                  <div className="space-y-2">
                    {BUDGETS.map((b) => (
                      <button type="button" key={b} onClick={() => update("budget_range", b)} className={`w-full px-4 py-3 text-left text-sm border transition-all ${form.budget_range === b ? "border-gold bg-onyx text-gold" : "border-gold-soft text-ivory/70 hover:border-gold/60"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-4 border border-gold-soft text-ivory uppercase tracking-[0.2em] text-xs">Back</button>
                  <button type="button" disabled={!form.budget_range} onClick={() => setStep(3)} className="flex-1 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <SectionHeading title="Your Details" align="left" />
                <div>
                  <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Full Name *</label>
                  <input required value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Email *</label>
                    <input required type="email" value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Phone *</label>
                    <input required value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} placeholder="+971 ..." className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-[0.3em] text-gold uppercase mb-3">Tell us about your vision</label>
                  <textarea rows={4} value={form.message} onChange={(e) => update("message", e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-4 border border-gold-soft text-ivory uppercase tracking-[0.2em] text-xs">Back</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? "Sending..." : "Submit Request"} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
