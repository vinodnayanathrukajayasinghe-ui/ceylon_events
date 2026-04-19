import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import { getFallbackEventImage, getFallbackEvents, normalizeEvent } from "@/lib/event-content";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Upcoming Luxury Events in Dubai | Ceylon Kandy Events" },
      {
        name: "description",
        content:
          "Discover upcoming galas, concerts, modeling showcases, and exclusive ticketed events curated by Ceylon Kandy Events in Dubai and the UAE.",
      },
      { property: "og:title", content: "Upcoming Events | Ceylon Kandy Events Dubai" },
      {
        property: "og:description",
        content: "Browse and book tickets for premium events in Dubai.",
      },
    ],
  }),
  component: EventsPage,
});

const FALLBACK = getFallbackEvents();

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
  const location = useLocation();
  const [events, setEvents] = useState<EventRow[]>(FALLBACK);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("All");

  if (location.pathname !== "/events") {
    return <Outlet />;
  }

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("event_date")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load events", error);
          setLoaded(true);
          return;
        }

        setEvents(
          data && data.length > 0
            ? (data as EventRow[]).map((event) => normalizeEvent(event))
            : FALLBACK,
        );
        setLoaded(true);
      });
  }, []);

  const filters = ["All", ...new Set(events.map((event) => event.category).filter(Boolean))];
  const filtered = filter === "All" ? events : events.filter((event) => event.category === filter);

  return (
    <SiteLayout>
      <section className="container-luxe pb-12 pt-24 text-center">
        <p className="mb-5 text-xs uppercase tracking-[0.5em] text-gold">Calendar</p>
        <h1 className="font-display text-5xl leading-[1.05] text-ivory md:text-7xl">
          Upcoming <span className="text-gradient-gold italic">Events</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          A curated calendar of high-energy luxury experiences across Dubai and beyond.
        </p>
      </section>

      <section className="container-luxe">
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-sm border px-5 py-2.5 text-xs uppercase tracking-[0.25em] transition-all ${
                filter === item
                  ? "border-transparent bg-gradient-gold text-primary-foreground"
                  : "border-gold-soft text-ivory/70 hover:border-gold hover:text-gold"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-32">
        <div className="container-luxe grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <a
              key={event.id}
              href={`/events/${event.slug}`}
              className="group relative overflow-hidden rounded-sm border border-gold-soft bg-charcoal transition-all duration-500 hover:border-gold"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={event.banner_url}
                  alt={event.title}
                  loading="lazy"
                  onError={(currentEvent) => {
                    currentEvent.currentTarget.src = getFallbackEventImage(event);
                  }}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
              </div>
              {event.status === "sold_out" && (
                <span className="absolute right-4 top-4 rounded-sm border border-gold bg-onyx/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-gold">
                  Sold Out
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
                  <Calendar size={12} />
                  {new Date(event.event_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mb-2 font-display text-2xl text-ivory">{event.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-ivory/70">{event.short_description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-ivory/70">
                    <MapPin size={12} />
                    {event.venue}
                  </span>
                  <span className="font-medium text-gold">
                    {event.base_price && event.base_price > 0
                      ? `${event.currency} ${event.base_price}`
                      : "Reserved"}
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  View Event <ArrowRight size={12} />
                </span>
              </div>
            </a>
          ))}
        </div>
        {loaded && filtered.length === 0 && (
          <p className="mt-20 text-center text-muted-foreground">No events match this filter.</p>
        )}
      </section>

      <section className="border-t border-gold-soft bg-charcoal/30 py-24">
        <div className="container-luxe">
          <SectionHeading eyebrow="Want a private experience?" title="Commission your own event." />
          <div className="mt-10 text-center">
            <Link
              to="/book"
              className="inline-flex items-center gap-3 rounded-sm bg-gradient-gold px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-all hover:shadow-gold-lg"
            >
              Book a Private Event <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
