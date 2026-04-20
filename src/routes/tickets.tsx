import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { getFallbackEventImage, getFallbackEvents, normalizeEvent } from "@/lib/event-content";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Buy Event Tickets | Dubai Luxury Events | Ceylon Kandy" },
      {
        name: "description",
        content:
          "Secure tickets for Dubai's most exclusive galas, concerts, parties, and luxury experiences.",
      },
      { property: "og:title", content: "Buy Tickets | Ceylon Kandy Events Dubai" },
      { property: "og:description", content: "Premium ticketed experiences in Dubai." },
    ],
  }),
  component: TicketsPage,
});

const FALLBACK = getFallbackEvents();

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

function formatPrice(value: number | null | undefined) {
  return Number(value || 0).toLocaleString("en-US");
}

function TicketsPage() {
  const location = useLocation();
  const [events, setEvents] = useState<TicketEventRow[]>(FALLBACK);

  if (location.pathname !== "/tickets") {
    return <Outlet />;
  }

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
      <section className="container-luxe pb-12 pt-24 text-center">
        <p className="mb-5 text-xs uppercase tracking-[0.5em] text-gold">Reserve Your Place</p>
        <h1 className="font-display text-5xl leading-[1.05] text-ivory md:text-7xl">
          Buy <span className="text-gradient-gold italic">Tickets</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Limited seats. Premium experiences. Secure online checkout.
        </p>
      </section>

      <section className="py-16">
        <div className="container-luxe space-y-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="overflow-hidden border border-gold-soft bg-charcoal transition-all duration-500 hover:border-gold md:grid md:grid-cols-3 md:gap-0"
            >
              <div className="aspect-[4/3] overflow-hidden md:col-span-1 md:aspect-auto">
                <img
                  src={event.banner_url}
                  alt={event.title}
                  onError={(currentEvent) => {
                    currentEvent.currentTarget.src = getFallbackEventImage(event);
                  }}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between gap-6 p-8 md:col-span-2 md:p-10">
                <div>
                  <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
                    <Calendar size={12} />
                    {new Date(event.event_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <h3 className="mb-3 font-display text-3xl text-ivory md:text-4xl">
                    {event.title}
                  </h3>
                  <p className="flex items-center gap-2 text-sm text-ivory/70">
                    <MapPin size={14} />
                    {event.venue}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gold-soft pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold">From</p>
                    <p className="price-display price-display--card">
                      <span className="price-currency">{event.currency || "AED"}</span>
                      <span className="price-value">{formatPrice(event.base_price)}</span>
                    </p>
                  </div>
                  {event.status === "sold_out" ? (
                    <span className="border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold">
                      Sold Out
                    </span>
                  ) : (
                    <a
                      href={`/tickets/${event.slug}`}
                      className="inline-flex items-center gap-2 bg-gradient-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-all hover:shadow-gold-lg"
                    >
                      <TicketIcon size={14} /> Get Tickets
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gold-soft bg-charcoal/30 py-24">
        <div className="container-luxe text-center">
          <SectionHeading
            eyebrow="Need help?"
            title="Concierge ticket support"
            subtitle="VIP tables, group bookings and corporate hospitality handled personally."
          />
          <Link
            to="/contact"
            className="mt-10 inline-block border border-gold px-8 py-4 text-xs uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold hover:text-primary-foreground"
          >
            Contact Concierge
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
