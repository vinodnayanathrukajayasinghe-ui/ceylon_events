import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import logo from "@/assets/logo-ceylon-kandy.png";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "Founder — Sameera Sinhapali | Ceylon Kandy Events Dubai" },
      { name: "description", content: "Meet Sameera Sinhapali — founder and creative director of Ceylon Kandy Events, Dubai's premier luxury event house." },
      { property: "og:title", content: "Sameera Sinhapali — Founder, Ceylon Kandy Events" },
      { property: "og:description", content: "The visionary behind Dubai's most exclusive events." },
    ],
  }),
  component: FounderPage,
});

const MILESTONES = [
  { year: "2013", t: "The First Soirée", d: "A private gathering in Colombo became the spark for a lifelong vocation." },
  { year: "2017", t: "Dubai Move", d: "Relocated to Dubai to serve a growing roster of GCC private clients." },
  { year: "2020", t: "Ceylon Kandy Events", d: "Founded the company, blending South Asian warmth with Emirati luxury." },
  { year: "2023", t: "Major Galas", d: "Curated international concerts and high-profile brand activations." },
  { year: "2026", t: "Today", d: "Leading a multi-disciplinary team across events, modelling, and entertainment." },
];

function FounderPage() {
  return (
    <SiteLayout>
      <section className="pt-24 pb-20">
        <div className="container-luxe grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 relative aspect-[4/5] max-w-md mx-auto w-full">
            <div className="absolute inset-0 -m-3 border border-gold opacity-50" />
            <div className="relative size-full bg-charcoal grid place-items-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-gold-soft" />
              <img src={logo} alt="Sameera Sinhapali" className="relative w-2/3 opacity-30" />
              <div className="absolute bottom-6 left-6 right-6 text-center">
                <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Portrait Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">The Founder</p>
            <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
              Sameera<br/><span className="text-gradient-gold italic">Sinhapali</span>
            </h1>
            <div className="mt-6 h-px w-24 bg-gradient-to-r from-gold to-transparent" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Founder & Creative Director of Ceylon Kandy Events. A visionary at the heart of Dubai's luxury events scene.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Sameera built Ceylon Kandy Events on a singular conviction: that every celebration deserves to be unforgettable. From private royal gatherings to internationally-attended galas, his quiet leadership has defined a new standard of premium event craft in the UAE.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              His philosophy unites South Asian hospitality, Emirati grandeur and global production discipline — a signature now recognised across Dubai's most discerning circles.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-charcoal/30 border-y border-gold-soft">
        <div className="container-luxe max-w-3xl text-center">
          <Quote size={40} className="text-gold mx-auto mb-6 opacity-70" />
          <p className="font-display italic text-3xl md:text-4xl text-ivory leading-snug">
            "Luxury is not what you spend. It is what you remember a decade later."
          </p>
          <p className="mt-8 text-xs tracking-[0.4em] text-gold uppercase">— Sameera Sinhapali</p>
        </div>
      </section>

      <section className="py-32">
        <div className="container-luxe">
          <SectionHeading eyebrow="The Journey" title="Milestones" />
          <div className="mt-16 max-w-3xl mx-auto space-y-px">
            {MILESTONES.map((m) => (
              <div key={m.year} className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] gap-6 p-6 border-t border-gold-soft hover:bg-charcoal/50 transition-colors">
                <p className="font-display text-3xl text-gradient-gold">{m.year}</p>
                <div>
                  <h3 className="font-display text-2xl text-ivory">{m.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
