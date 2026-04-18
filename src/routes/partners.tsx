import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import logoMain from "@/assets/logo-ceylon-kandy.png";
import logoLeo from "@/assets/partner-leo.png";
import logoJunctions from "@/assets/partner-junctions-blast.png";
import logoAcademy from "@/assets/partner-ceylon-models-academy.png";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — The Ceylon Kandy Group | Dubai" },
      { name: "description", content: "Meet the family of brands within the Ceylon Kandy ecosystem — events, modelling, hospitality and entertainment partners across Dubai." },
      { property: "og:title", content: "Our Partners — Ceylon Kandy Events Group" },
      { property: "og:description", content: "An ecosystem of premium brands powering Dubai's luxury event industry." },
    ],
  }),
  component: PartnersPage,
});

const PARTNERS = [
  { logo: logoMain, name: "Ceylon Models", category: "Talent & Modelling", description: "A curated roster of Dubai's most sought-after models, hosts and brand ambassadors." },
  { logo: logoAcademy, name: "Ceylon Models Academy", category: "Education", description: "Training the next generation of South Asian fashion and runway talent in the UAE." },
  { logo: logoJunctions, name: "Junctions Blast Event", category: "Production", description: "Large-format event production — staging, lighting, sound and AV engineering." },
  { logo: logoLeo, name: "Leo Consultancy", category: "Strategy", description: "Strategic event consultancy and brand activation for corporate and government clients." },
];

function PartnersPage() {
  return (
    <SiteLayout>
      <section className="pt-24 pb-12 text-center container-luxe">
        <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">The Ecosystem</p>
        <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
          Our <span className="text-gradient-gold italic">Valuable Partners</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">A family of premium brands powering every Ceylon Kandy production.</p>
      </section>

      <section className="py-16">
        <div className="container-luxe grid md:grid-cols-2 gap-8">
          {PARTNERS.map((p) => (
            <div key={p.name} className="group relative border border-gold-soft bg-charcoal p-10 hover:border-gold hover:bg-onyx transition-all duration-500">
              <div className="aspect-video grid place-items-center mb-8 bg-onyx border border-gold-soft p-6">
                <img src={p.logo} alt={p.name} className="max-h-32 w-auto opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-2">{p.category}</p>
              <h3 className="font-display text-3xl text-ivory mb-3">{p.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              <span className="inline-flex items-center gap-2 mt-6 text-xs uppercase tracking-[0.25em] text-gold">
                Within the Group <ExternalLink size={12} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-charcoal/30 border-t border-gold-soft">
        <div className="container-luxe">
          <SectionHeading eyebrow="Become a Partner" title="Collaborate with the Group" subtitle="Hospitality brands, venues, suppliers and creative agencies — we welcome strategic alliances aligned with our values." />
          <div className="text-center mt-10">
            <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:shadow-gold-lg transition-all">
              Partnership Inquiries <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
