import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { TicketCheckout } from "@/components/TicketCheckout";
import { supabase } from "@/integrations/supabase/client";
import { getFallbackEventImage, normalizeEvent } from "@/lib/event-content";
import { whatsappLink } from "@/lib/site";

interface EventDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  event_date: string;
  event_time: string | null;
  venue: string;
  city: string | null;
  base_price: number | null;
  currency: string | null;
  banner_url: string | null;
  status: string;
  category: string | null;
}

export const Route = createFileRoute("/events/$eventId")({
  head: ({ params }) => ({
    meta: [
      { title: `Event - ${params.eventId.replace(/-/g, " ")} | Ceylon Kandy Events` },
      { name: "description", content: "Premium event details, venue, schedule and tickets." },
    ],
  }),
  component: EventDetailPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-5xl text-gradient-gold">Event Not Found</h1>
        <Link
          to="/events"
          className="mt-8 inline-block text-gold uppercase tracking-[0.3em] text-xs"
        >
          Back to Events
        </Link>
      </div>
    </SiteLayout>
  ),
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("events")
      .select("*")
      .eq("slug", eventId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load event details", error);
        }

        setEvent(data ? normalizeEvent(data as EventDetail) : null);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) {
    return (
      <SiteLayout>
        <section className="container-luxe py-32">
          <div className="h-10 w-52 bg-gold-soft/20 animate-pulse mb-8" />
          <div className="h-[52vh] rounded-sm border border-gold-soft bg-charcoal/60 animate-pulse" />
        </section>
      </SiteLayout>
    );
  }

  if (!event) throw notFound();

  return (
    <SiteLayout>
      <div className="relative h-[60vh] min-h-[400px] -mt-20 pt-20 overflow-hidden">
        <img
          src={event.banner_url}
          alt={event.title}
          onError={(currentEvent) => {
            currentEvent.currentTarget.src = getFallbackEventImage(event);
          }}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/60 to-onyx/30" />
        <div className="container-luxe relative z-10 flex h-full flex-col justify-end pb-12">
          <Link
            to="/events"
            className="mb-6 inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold transition-all hover:gap-3"
          >
            <ArrowLeft size={14} /> All Events
          </Link>
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-gold">{event.category}</p>
          <h1 className="max-w-4xl font-display text-4xl leading-[1.05] text-ivory md:text-7xl">
            {event.title}
          </h1>
        </div>
      </div>

      <section className="py-20">
        <div className="container-luxe grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-6 font-display text-3xl text-ivory">About this Event</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-ivory/80">
              {event.description}
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="border border-gold-soft bg-charcoal p-6">
                <Calendar size={20} className="mb-3 text-gold" />
                <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gold">Date</p>
                <p className="text-ivory">
                  {new Date(event.event_date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="border border-gold-soft bg-charcoal p-6">
                <Clock size={20} className="mb-3 text-gold" />
                <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gold">Time</p>
                <p className="text-ivory">{event.event_time}</p>
              </div>
              <div className="border border-gold-soft bg-charcoal p-6">
                <MapPin size={20} className="mb-3 text-gold" />
                <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gold">Venue</p>
                <p className="text-ivory">{event.venue}</p>
                <p className="text-xs text-muted-foreground">{event.city}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-28">
            {event.status !== "sold_out" ? (
              <TicketCheckout eventId={event.id} eventTitle={event.title} currency={event.currency} />
            ) : (
              <div className="border border-gold bg-gradient-to-b from-charcoal to-onyx p-8">
                <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-gold">Starting From</p>
                <p className="mb-6 font-display text-5xl text-gradient-gold">
                  {event.base_price && event.base_price > 0
                    ? `${event.currency} ${event.base_price}`
                    : "Invitation Only"}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center rounded-sm bg-gradient-gold py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground"
                >
                  Enquire Now
                </Link>
              </div>
            )}
            <a
              href={whatsappLink(`Hi, I'd like more info on ${event.title}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center border border-gold-soft py-4 text-xs uppercase tracking-[0.2em] text-ivory transition-all hover:border-gold hover:text-gold"
            >
              Chat on WhatsApp
            </a>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
