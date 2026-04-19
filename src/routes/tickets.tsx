import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { getFallbackEventImage, normalizeEvent } from "@/lib/event-content";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Buy Event Tickets — Dubai Luxury Events | Ceylon Kandy" },
      {
        name: "description",
        content:
          "Secure tickets for Dubai's most exclusive galas, concerts and luxury experiences.",
      },
      { property: "og:title", content: "Buy Tickets — Ceylon Kandy Events Dubai" },
      { property: "og:description", content: "Premium ticketed experiences in Dubai." },
    ],
  }),
  component: TicketsPage,
});

const FALLBACK = [
  {
    id: "1",
    slug: "royal-gala-night-2025",
    title: "Royal Gala Night 2025",
    event_date: "2025-12-20",
    venue: "Atlantis The Palm",
    base_price: 850,
    currency: "AED",
    banner_url: g1,
    status: "upcoming",
  },
  {
    id: "2",
    slug: "desert-stars-concert",
    title: "Desert Stars Concert",
    event_date: "2026-01-18",
    venue: "Al Marmoom Desert",
    base_price: 450,
    currency: "AED",
    banner_url: g2,
    status: "upcoming",
  },
  {
    id: "4",
    slug: "bollywood-night-marina",
    title: "Bollywood Night Marina",
    event_date: "2026-02-14",
    venue: "Pier 7",
    base_price: 350,
    currency: "AED",
    banner_url: g3,
    status: "upcoming",
  },
];

interface TicketEventRow {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  venue: string;
  base_price: number | null;
  currency: string | null;
  banner_url: string | null;
  status: string;
}

function TicketsPage() {
  const [events, setEvents] = useState<TicketEventRow[]>(FALLBACK.map((event) => normalizeEvent(event)));

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .neq("status", "completed")
      .order("event_date")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load ticketed events", error);
          return;
        }

        if (data && data.length > 0) {
          setEvents((data as TicketEventRow[]).map((event) => normalizeEvent(event)));
        }
      });
  }, []);

  return (
    <SiteLayout>
      <section className="pt-24 pb-12 text-center container-luxe">
        <p className="text-xs tracking-[0.5em] text-gold uppercase mb-5">Reserve Your Place</p>
        <h1 className="font-display text-5xl md:text-7xl text-ivory leading-[1.05]">
          Buy <span className="text-gradient-gold italic">Tickets</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
          Limited seats. Premium experiences. Secure online checkout.
        </p>
      </section>

      <section className="py-16">
        <div className="container-luxe space-y-8">
          {events.map((e) => (
            <div
              key={e.id}
              className="grid md:grid-cols-3 gap-0 border border-gold-soft bg-charcoal hover:border-gold transition-all duration-500 overflow-hidden"
            >
              <div className="md:col-span-1 aspect-[4/3] md:aspect-auto overflow-hidden">
                <img
                  src={e.banner_url || g1}
                  alt={e.title}
                  onError={(event) => {
                    event.currentTarget.src = getFallbackEventImage(e);
                  }}
                  className="size-full object-cover"
                />
              </div>
              <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-3 flex items-center gap-2">
                    <Calendar size={12} />
                    {new Date(e.event_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl text-ivory mb-3">{e.title}</h3>
                  <p className="text-sm text-ivory/70 flex items-center gap-2">
                    <MapPin size={14} />
                    {e.venue}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gold-soft">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] text-gold uppercase">From</p>
                    <p className="font-display text-3xl text-gradient-gold">
                      {e.currency || "AED"} {e.base_price}
                    </p>
                  </div>
                  {e.status === "sold_out" ? (
                    <span className="px-6 py-3 border border-gold text-gold uppercase tracking-[0.2em] text-xs">
                      Sold Out
                    </span>
                  ) : (
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: e.slug }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium hover:shadow-gold-lg transition-all"
                    >
                      <TicketIcon size={14} /> Get Tickets
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-charcoal/30 border-t border-gold-soft">
        <div className="container-luxe text-center">
          <SectionHeading
            eyebrow="Need help?"
            title="Concierge ticket support"
            subtitle="VIP tables, group bookings and corporate hospitality — handled personally."
          />
          <Link
            to="/contact"
            className="mt-10 inline-block px-8 py-4 border border-gold text-gold uppercase tracking-[0.2em] text-xs hover:bg-gold hover:text-primary-foreground transition-all"
          >
            Contact Concierge
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
