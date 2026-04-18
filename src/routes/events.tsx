import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Upcoming Luxury Events in Dubai — Ceylon Kandy Events" },
      { name: "description", content: "Discover upcoming galas, concerts, and exclusive ticketed events curated by Ceylon Kandy Events in Dubai and the UAE." },
      { property: "og:title", content: "Upcoming Events — Ceylon Kandy Events Dubai" },
      { property: "og:description", content: "Browse and book tickets for premium events in Dubai." },
    ],
  }),
  component: EventsPage,
});

const FALLBACK = [
  { id: "1", slug: "royal-gala-night-2025", title: "Royal Gala Night 2025", short_description: "An intimate evening of Dubai's most distinguished guests.", event_date: "2025-12-20", venue: "Atlantis The Palm", city: "Dubai", base_price: 850, currency: "AED", status: "upcoming", banner_url: g1, category: "Gala" },
  { id: "2", slug: "desert-stars-concert", title: "Desert Stars Concert", short_description: "World-class artists under the Arabian sky.", event_date: "2026-01-18", venue: "Al Marmoom Desert", city: "Dubai", base_price: 450, currency: "AED", status: "upcoming", banner_url: g2, category: "Concert" },
  { id: "3", slug: "new-year-rooftop-2026", title: "New Year Rooftop 2026", short_description: "Dubai's most exclusive countdown above the city skyline.", event_date: "2025-12-31", venue: "SLS Dubai", city: "Dubai", base_price: 0, currency: "AED", status: "sold_out", banner_url: g4, category: "Party" },
  { id: "4", slug: "bollywood-night-marina", title: "Bollywood Night Marina", short_description: "South Asian cinema reimagined for Dubai's glitterati.", event_date: "2026-02-14", venue: "Pier 7", city: "Dubai", base_price: 350, currency: "AED", status: "upcoming", banner_url: g3, category: "Concert" },
  { id: "5", slug: "vogue-fashion-soiree", title: "Vogue Fashion Soirée", short_description: "Couture meets Arabian glamour in a one-night runway.", event_date: "2026-03-08", venue: "Burj Al Arab Skyview", city: "Dubai", base_price: 1200, currency: "AED", status: "upcoming", banner_url: g5, category: "Fashion" },
  { id: "6", slug: "ramadan-iftar-soiree", title: "Ramadan Iftar Soirée", short_description: "An exquisite evening of tradition and modern luxury.", event_date: "2026-03-22", venue: "Madinat Jumeirah", city: "Dubai", base_price: 650, currency: "AED", status: "upcoming", banner_url: g6, category: "Cultural" },
];

const FILTERS = ["All", "Gala", "Concert", "Party", "Fashion", "Cultural"] as const;

interface EventRow {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  event_date: string;
  venue: string;
  city: string | null;
  base_price: number | null;
  currency: string | null;
  status: string;
  banner_url: string | null;
  category: string | null;
}

function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>(FALLBACK);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");

  useEffect(() => {
    supabase.from("events").select("*").eq("is_published", true).order("event_date").then(({ data }) => {
      if (data && data.length > 0) setEvents(data as EventRow[]);
    });
  }, []);

  const filtered = filter === "All" ? events : events.filter((e) => e.category === filter);

  return (
    <SiteLayout>
      <section className="pt-24 pb-12 text-center container-luxe">
        <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">Calendar</p>
        <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
          Upcoming <span className="text-gradient-gold italic">Events</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">A curated calendar of luxury experiences across Dubai and beyond.</p>
      </section>

      <section className="container-luxe">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 text-xs uppercase tracking-[0.25em] border rounded-sm transition-all ${
                filter === f ? "bg-gradient-gold text-primary-foreground border-transparent" : "border-gold-soft text-ivory/70 hover:border-gold hover:text-gold"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-32">
        <div className="container-luxe grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((e) => (
            <Link
              key={e.id}
              to="/events/$eventId"
              params={{ eventId: e.slug }}
              className="group relative overflow-hidden rounded-sm border border-gold-soft bg-charcoal hover:border-gold transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img src={e.banner_url || g1} alt={e.title} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
              </div>
              {e.status === "sold_out" && (
                <span className="absolute top-4 right-4 px-3 py-1.5 text-[10px] tracking-[0.25em] uppercase bg-onyx/80 text-gold border border-gold rounded-sm">Sold Out</span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-2 flex items-center gap-2">
                  <Calendar size={12} />{new Date(e.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <h3 className="font-display text-2xl text-ivory mb-2">{e.title}</h3>
                <p className="text-sm text-ivory/70 line-clamp-2 mb-3">{e.short_description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-ivory/70"><MapPin size={12} />{e.venue}</span>
                  <span className="text-gold font-medium">{e.base_price && e.base_price > 0 ? `${e.currency} ${e.base_price}` : "Reserved"}</span>
                </div>
                <span className="inline-flex items-center gap-2 mt-4 text-xs tracking-[0.25em] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Event <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center mt-20 text-muted-foreground">No events match this filter.</p>
        )}
      </section>

      <section className="py-24 border-t border-gold-soft bg-charcoal/30">
        <div className="container-luxe">
          <SectionHeading eyebrow="Want a private experience?" title="Commission your own event." />
          <div className="mt-10 text-center">
            <Link to="/book" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:shadow-gold-lg transition-all">
              Book a Private Event <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
