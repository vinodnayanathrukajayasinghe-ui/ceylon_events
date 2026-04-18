import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { SITE, telLink, whatsappLink } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ceylon Kandy Events Dubai | +971 50 407 3638" },
      { name: "description", content: "Speak with Ceylon Kandy Events Dubai. Phone, WhatsApp, email and inquiry form for premium event planning." },
      { property: "og:title", content: "Contact Ceylon Kandy Events — Dubai" },
      { property: "og:description", content: "Reach Dubai's premier luxury events house." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject || null,
      message: form.message,
      source: "contact_form",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
  };

  return (
    <SiteLayout>
      <section className="pt-24 pb-12 text-center container-luxe">
        <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">Reach Us</p>
        <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
          Begin a <span className="text-gradient-gold italic">Conversation</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">Our concierge replies within 24 hours.</p>
      </section>

      <section className="py-20">
        <div className="container-luxe grid lg:grid-cols-5 gap-12">
          <aside className="lg:col-span-2 space-y-6">
            {[
              { Icon: Phone, label: "Call Us", value: SITE.phone, href: telLink },
              { Icon: MessageCircle, label: "WhatsApp", value: SITE.phone, href: whatsappLink() },
              { Icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
              { Icon: MapPin, label: "Location", value: "Dubai, United Arab Emirates", href: "#" },
            ].map(({ Icon, label, value, href }) => (
              <a key={label} href={href} target={label === "WhatsApp" ? "_blank" : undefined} rel="noreferrer" className="block p-6 border border-gold-soft bg-charcoal hover:border-gold hover:bg-onyx transition-all duration-500 group">
                <Icon size={22} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-1">{label}</p>
                <p className="text-ivory">{value}</p>
              </a>
            ))}
          </aside>

          <div className="lg:col-span-3">
            {done ? (
              <div className="border border-gold-soft bg-charcoal p-12 text-center">
                <CheckCircle2 size={56} className="text-gold mx-auto mb-6" />
                <h2 className="font-display text-4xl text-gradient-gold mb-4">Message Received</h2>
                <p className="text-muted-foreground">Our concierge will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-gold-soft bg-charcoal p-8 md:p-10 space-y-5">
                <h2 className="font-display text-3xl text-ivory mb-2">Send a Message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input required placeholder="Full Name *" value={form.name} onChange={(e) => update("name", e.target.value)} className="bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                  <input required type="email" placeholder="Email *" value={form.email} onChange={(e) => update("email", e.target.value)} className="bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                  <input placeholder="Subject" value={form.subject} onChange={(e) => update("subject", e.target.value)} className="bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                </div>
                <textarea required rows={5} placeholder="Tell us about your event or inquiry..." value={form.message} onChange={(e) => update("message", e.target.value)} className="w-full bg-onyx border border-gold-soft px-4 py-3 text-ivory focus:outline-none focus:border-gold" />
                <button type="submit" disabled={submitting} className="w-full py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm disabled:opacity-60 hover:shadow-gold-lg transition-all">
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
