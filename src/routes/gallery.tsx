import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import hero from "@/assets/hero-gala.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Luxury Dubai Events | Ceylon Kandy Events" },
      { name: "description", content: "A visual journey through Dubai's most cinematic events curated by Ceylon Kandy Events." },
      { property: "og:title", content: "Gallery — Ceylon Kandy Events Dubai" },
      { property: "og:description", content: "Editorial photography of luxury galas, weddings and concerts in Dubai." },
    ],
  }),
  component: GalleryPage,
});

const IMAGES = [
  { src: hero, cat: "Gala", title: "Royal Gala Night" },
  { src: g1, cat: "Wedding", title: "Palm Wedding Reception" },
  { src: g2, cat: "Concert", title: "Desert Stars" },
  { src: g3, cat: "Production", title: "Stage Production" },
  { src: g4, cat: "Party", title: "Rooftop New Year" },
  { src: g5, cat: "Fashion", title: "Vogue Soirée" },
  { src: g6, cat: "Cultural", title: "Iftar Soirée" },
  { src: g1, cat: "Gala", title: "Diamond Awards" },
  { src: g2, cat: "Concert", title: "Marina Live" },
  { src: g3, cat: "Production", title: "Light Architecture" },
  { src: g4, cat: "Party", title: "Yacht Soirée" },
  { src: g5, cat: "Fashion", title: "Couture Night" },
];

const CATS = ["All", "Gala", "Wedding", "Concert", "Party", "Fashion", "Cultural", "Production"];

function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const filtered = filter === "All" ? IMAGES : IMAGES.filter((i) => i.cat === filter);

  return (
    <SiteLayout>
      <section className="pt-24 pb-12 text-center container-luxe">
        <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">The Archive</p>
        <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
          Moments of <span className="text-gradient-gold italic">Brilliance</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">A curated visual diary of Ceylon Kandy Events.</p>
      </section>

      <section className="container-luxe mb-12 flex flex-wrap justify-center gap-3">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-5 py-2.5 text-xs uppercase tracking-[0.25em] border rounded-sm transition-all ${
              filter === c ? "bg-gradient-gold text-primary-foreground border-transparent" : "border-gold-soft text-ivory/70 hover:border-gold hover:text-gold"
            }`}
          >
            {c}
          </button>
        ))}
      </section>

      <section className="pb-32">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightbox(img.src)}
              className={`group relative overflow-hidden rounded-sm ${i % 7 === 0 ? "row-span-2 col-span-2" : ""}`}
            >
              <img src={img.src} alt={img.title} loading="lazy" className="size-full object-cover aspect-square transition-all duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-onyx/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-left">
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase">{img.cat}</p>
                <p className="font-display text-lg text-ivory mt-1">{img.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-[200] bg-onyx/95 backdrop-blur-md grid place-items-center p-6 animate-fade-in cursor-zoom-out">
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 size-12 grid place-items-center border border-gold text-gold rounded-full hover:bg-gold hover:text-primary-foreground transition-all">
            <X size={20} />
          </button>
          <img src={lightbox} alt="" className="max-w-[90vw] max-h-[88vh] object-contain border border-gold" />
        </div>
      )}
    </SiteLayout>
  );
}
