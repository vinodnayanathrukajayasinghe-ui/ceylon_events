import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { ArrowRight, Crown, Heart, Building2, Music, Sparkles, Mic2, PartyPopper, Camera, Users, Gem, Lightbulb, Megaphone } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Luxury Event Planning Dubai | Ceylon Kandy Events" },
      { name: "description", content: "Premium event planning in Dubai: corporate galas, private parties, weddings, concerts, brand launches, VIP management, and full event production." },
      { property: "og:title", content: "Premium Event Services — Ceylon Kandy Events Dubai" },
      { property: "og:description", content: "End-to-end luxury event planning, ticketing, production and VIP services in Dubai and the wider UAE." },
    ],
  }),
  component: ServicesPage,
});

const SERVICES = [
  { icon: Crown, title: "Corporate Galas", desc: "Boardroom-grade galas, summits, awards nights and executive retreats produced with white-glove discretion." },
  { icon: Heart, title: "Luxury Weddings", desc: "Cinematic weddings — palace, beach, desert or yacht. Curated end-to-end from styling to honeymoon coordination." },
  { icon: PartyPopper, title: "Private Celebrations", desc: "Birthdays, anniversaries, family gatherings — bespoke celebrations hosted with absolute confidentiality." },
  { icon: Music, title: "Concerts & Festivals", desc: "Full festival production — staging, sound, lighting, ticketing, artist liaison and security." },
  { icon: Megaphone, title: "Brand Launches", desc: "Product reveals and brand activations engineered for press, social and word-of-mouth resonance." },
  { icon: Mic2, title: "Live Entertainment", desc: "Curated international DJs, vocalists, dancers, and performance artists across genres." },
  { icon: Building2, title: "Venue Coordination", desc: "Privileged access to Dubai's most coveted venues — Atlantis, Burj Al Arab, Address Sky View, SLS, and beyond." },
  { icon: Lightbulb, title: "Event Production", desc: "AV, lighting, staging, scenography and rigging — engineered to broadcast and cinema standards." },
  { icon: Sparkles, title: "Decor & Styling", desc: "Floral, tablescape, lounge and atmospheric design that transforms any venue into a private world." },
  { icon: Users, title: "VIP Management", desc: "Hospitality concierge for royal, celebrity and executive guests — arrivals, suites, security, and itineraries." },
  { icon: Camera, title: "Content & Coverage", desc: "Cinematic videography, editorial photography and live social coverage during your event." },
  { icon: Gem, title: "Concierge & Hospitality", desc: "After-event journeys — yachts, dining, retreats and bespoke gifting curated to each guest." },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="relative pt-24 pb-20">
        <div className="absolute inset-0 bg-radial-gold opacity-40" />
        <div className="container-luxe relative text-center">
          <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">A Complete Ecosystem</p>
          <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05] max-w-4xl mx-auto">
            Premium services, <span className="text-gradient-gold italic">flawlessly</span> orchestrated.
          </h1>
          <p className="mt-8 text-lg text-ivory/75 max-w-2xl mx-auto leading-relaxed">
            From the first concept sketch to the final firework, every element of your event lives under one trusted house.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container-luxe">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gold-soft/40 border border-gold-soft">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-onyx p-10 hover:bg-charcoal transition-all duration-500 group cursor-pointer">
                <Icon size={28} className="text-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-2xl text-ivory mb-3 group-hover:text-gold transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-luxe">
          <SectionHeading eyebrow="The Process" title="From Concept to Curtain" />
          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {[
              { n: "01", t: "Discover", d: "A private consultation to understand your vision and guests." },
              { n: "02", t: "Design", d: "Concept boards, scenography and a complete production blueprint." },
              { n: "03", t: "Deliver", d: "Coordinated execution — venue, talent, decor, AV, hospitality." },
              { n: "04", t: "Delight", d: "On-night excellence and a curated post-event aftercare experience." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <p className="font-display text-7xl text-gradient-gold/40 leading-none">{s.n}</p>
                <h3 className="font-display text-2xl text-ivory mt-4">{s.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gold-soft bg-charcoal/30">
        <div className="container-luxe text-center">
          <h2 className="font-display text-4xl md:text-5xl text-ivory">Begin a private conversation.</h2>
          <Link to="/book" className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:shadow-gold-lg transition-all">
            Request a Proposal <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
