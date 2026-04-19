import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { ArrowRight } from "lucide-react";
import iconCorporate from "@/assets/services/corporate-galas.jpg";
import iconWeddings from "@/assets/services/luxury-weddings.jpg";
import iconPrivate from "@/assets/services/private-celebrations.jpg";
import iconConcerts from "@/assets/services/concerts-festivals.jpg";
import iconBrand from "@/assets/services/brand-launches.jpg";
import iconLive from "@/assets/services/live-entertainment.jpg";
import iconVenue from "@/assets/services/venue-coordination.jpg";
import iconProduction from "@/assets/services/event-production.jpg";
import iconDecor from "@/assets/services/decor-styling.jpg";
import iconVip from "@/assets/services/vip-management.jpg";
import iconContent from "@/assets/services/content-coverage.jpg";
import iconConcierge from "@/assets/services/concierge-hospitality.jpg";

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
  { img: iconCorporate, title: "Corporate Galas", desc: "Boardroom-grade galas, summits, awards nights and executive retreats produced with white-glove discretion." },
  { img: iconWeddings, title: "Luxury Weddings", desc: "Cinematic weddings — palace, beach, desert or yacht. Curated end-to-end from styling to honeymoon coordination." },
  { img: iconPrivate, title: "Private Celebrations", desc: "Birthdays, anniversaries, family gatherings — bespoke celebrations hosted with absolute confidentiality." },
  { img: iconConcerts, title: "Concerts & Festivals", desc: "Full festival production — staging, sound, lighting, ticketing, artist liaison and security." },
  { img: iconBrand, title: "Brand Launches", desc: "Product reveals and brand activations engineered for press, social and word-of-mouth resonance." },
  { img: iconLive, title: "Live Entertainment", desc: "Curated international DJs, vocalists, dancers, and performance artists across genres." },
  { img: iconVenue, title: "Venue Coordination", desc: "Privileged access to Dubai's most coveted venues — Atlantis, Burj Al Arab, Address Sky View, SLS, and beyond." },
  { img: iconProduction, title: "Event Production", desc: "AV, lighting, staging, scenography and rigging — engineered to broadcast and cinema standards." },
  { img: iconDecor, title: "Decor & Styling", desc: "Floral, tablescape, lounge and atmospheric design that transforms any venue into a private world." },
  { img: iconVip, title: "VIP Management", desc: "Hospitality concierge for royal, celebrity and executive guests — arrivals, suites, security, and itineraries." },
  { img: iconContent, title: "Content & Coverage", desc: "Cinematic videography, editorial photography and live social coverage during your event." },
  { img: iconConcierge, title: "Concierge & Hospitality", desc: "After-event journeys — yachts, dining, retreats and bespoke gifting curated to each guest." },
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ img, title, desc }) => (
              <article key={title} className="group relative overflow-hidden border border-gold-soft bg-onyx hover:border-gold transition-all duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="size-full object-cover group-hover:scale-110 transition-transform duration-[1200ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
                </div>
                <div className="p-7 -mt-16 relative">
                  <h3 className="font-display text-2xl text-ivory mb-3 group-hover:text-gold transition-colors">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </article>
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
