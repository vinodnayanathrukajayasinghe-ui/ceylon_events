import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { Counter } from "@/components/Counter";
import { Award, Sparkles, Globe2, Crown } from "lucide-react";
import hero from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ceylon Kandy Events Dubai" },
      { name: "description", content: "Ceylon Kandy Events is Dubai's premier luxury event company — crafting bespoke galas, weddings, brand launches and concerts with cinematic precision." },
      { property: "og:title", content: "About — Ceylon Kandy Events Dubai" },
      { property: "og:description", content: "Dubai's most trusted luxury events brand. Story, philosophy, and the team behind every unforgettable night." },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Crown, title: "Uncompromising Luxury", text: "Every detail, refined. Every moment, intentional." },
  { icon: Sparkles, title: "Cinematic Vision", text: "We design events the way auteurs design films." },
  { icon: Globe2, title: "Globally Connected", text: "Talent, suppliers and partners across continents." },
  { icon: Award, title: "Quiet Excellence", text: "We let the experience speak — not the marketing." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="relative pt-24 pb-32">
        <div className="container-luxe grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">Our Story</p>
            <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
              Crafting <span className="text-gradient-gold italic">Dubai's</span><br/>finest moments.
            </h1>
            <div className="mt-8 h-px w-24 bg-gradient-to-r from-gold to-transparent" />
            <p className="mt-8 text-lg text-ivory/80 leading-relaxed">
              Ceylon Kandy Events is the premier luxury events house of Dubai — a sanctuary for those who believe a celebration is not an evening, but a memory built to outlast time.
            </p>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              From private royal galas at Atlantis to brand launches at Burj Al Arab, our work defines a new vocabulary of Middle Eastern hospitality — one composed of restraint, theatre, and devotion.
            </p>
          </div>
          <div className="relative aspect-[4/5]">
            <div className="absolute inset-0 -m-3 border border-gold opacity-50" />
            <img src={hero} alt="Luxury Dubai event" className="size-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-charcoal/40 border-y border-gold-soft">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-12">
          <Counter end={12} suffix="+" label="Years of Excellence" />
          <Counter end={480} suffix="+" label="Events Crafted" />
          <Counter end={15000} suffix="+" label="Happy Guests" />
          <Counter end={50} suffix="+" label="Premium Partners" />
        </div>
      </section>

      <section className="py-32">
        <div className="container-luxe">
          <SectionHeading eyebrow="What Defines Us" title="Our Philosophy" subtitle="Four principles guide every event, every guest, every detail." />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gold-soft/40 border border-gold-soft">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-onyx p-10 hover:bg-charcoal transition-all duration-500 group">
                <Icon size={28} className="text-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-2xl text-ivory mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-charcoal/30 border-y border-gold-soft">
        <div className="container-luxe grid lg:grid-cols-2 gap-16 items-center">
          <img src={g3} alt="Production" className="aspect-[4/3] object-cover rounded-sm border border-gold-soft" />
          <div>
            <p className="text-xs tracking-[0.4em] text-gold uppercase mb-4">Our Promise</p>
            <h2 className="font-display text-4xl md:text-5xl text-ivory leading-tight">
              Every event is a <span className="text-gradient-gold italic">private commission</span>.
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              We do not replicate. We do not template. Each engagement begins with a private conversation and ends with a moment your guests will remember a decade from now.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Headquartered in Dubai with global production capability, we serve a discerning clientele across the GCC, South Asia, and Europe.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
