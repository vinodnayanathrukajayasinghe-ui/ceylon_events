import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { TicketCheckout } from "@/components/TicketCheckout";
import { supabase } from "@/integrations/supabase/client";
import {
  getFallbackEventBySlug,
  getFallbackEventImage,
  getFallbackTicketCategoriesBySlug,
  normalizeEvent,
} from "@/lib/event-content";

interface TicketEventDetail {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
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

function formatPrice(value: number | null | undefined) {
  return Number(value || 0).toLocaleString("en-US");
}

export const Route = createFileRoute("/tickets/$eventId")({
  head: ({ params }) => ({
    meta: [
      { title: `Buy Tickets - ${params.eventId.replace(/-/g, " ")} | Ceylon Kandy Events` },
      { name: "description", content: "Secure your place for this exclusive Ceylon Kandy event." },
    ],
  }),
  component: TicketEventPage,
});

function TicketEventPage() {
  const { eventId } = Route.useParams();
  const fallbackEvent = getFallbackEventBySlug(eventId) as TicketEventDetail | null;
  const [event, setEvent] = useState<TicketEventDetail | null>(fallbackEvent);
  const [loading, setLoading] = useState(!fallbackEvent);

  useEffect(() => {
    if (!fallbackEvent) setLoading(true);
    supabase
      .from("events")
      .select("*")
      .eq("slug", eventId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load ticket event", error);
        }

        setEvent(data ? normalizeEvent(data as TicketEventDetail) : fallbackEvent);
        setLoading(false);
      });
  }, [eventId, fallbackEvent]);

  if (loading) {
    return (
      <SiteLayout>
        <section className="container-luxe py-32">
          <div className="h-10 w-56 bg-gold-soft/20 animate-pulse mb-8" />
          <div className="h-[58vh] rounded-sm border border-gold-soft bg-charcoal/60 animate-pulse" />
        </section>
      </SiteLayout>
    );
  }

  if (!event) throw notFound();

  return (
    <SiteLayout>
      <section className="relative min-h-[78vh] -mt-20 overflow-hidden pt-24">
        <img
          src={event.banner_url}
          alt={event.title}
          onError={(currentEvent) => {
            currentEvent.currentTarget.src = getFallbackEventImage(event);
          }}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,6,4,0.88)_10%,rgba(7,6,4,0.68)_46%,rgba(7,6,4,0.82)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/55 via-onyx/25 to-onyx/88" />

        <div className="container-luxe relative z-10 py-20">
          <Link
            to="/tickets"
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold transition-all hover:gap-3"
          >
            <ArrowLeft size={14} /> All Tickets
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_430px] lg:items-start">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">{event.category}</p>
              <h1 className="max-w-4xl font-display text-4xl leading-[1.02] text-ivory md:text-7xl">
                {event.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/78">
                {event.short_description}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="border border-gold-soft bg-onyx/55 p-5 backdrop-blur-md">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold">Date</p>
                  <p className="flex items-center gap-2 text-sm text-ivory">
                    <Calendar size={14} className="text-gold" />
                    {new Date(event.event_date).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="border border-gold-soft bg-onyx/55 p-5 backdrop-blur-md">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold">Venue</p>
                  <p className="flex items-center gap-2 text-sm text-ivory">
                    <MapPin size={14} className="text-gold" />
                    {event.venue}
                  </p>
                </div>
                <div className="border border-gold-soft bg-onyx/55 p-5 backdrop-blur-md">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold">From</p>
                  <div className="flex items-end gap-3">
                    <TicketIcon size={14} className="mb-2 text-gold" />
                    <p className="price-display price-display--compact">
                      <span className="price-currency">{event.currency || "AED"}</span>
                      <span className="price-value">{formatPrice(event.base_price)}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 max-w-2xl border border-gold-soft bg-onyx/45 p-6 backdrop-blur-md">
                <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">Event Brief</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ivory/78">
                  {event.description}
                </p>
              </div>
            </div>

            <div className="lg:sticky lg:top-28">
              {event.status === "sold_out" ? (
                <div className="border border-gold bg-gradient-to-b from-charcoal to-onyx p-8 text-center">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">Ticket Status</p>
                  <p className="mb-5 font-display text-4xl text-gradient-gold">Sold Out</p>
                  <p className="mb-6 text-sm text-ivory/75">
                    This experience is currently fully reserved. Contact concierge for waiting list access.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex w-full items-center justify-center rounded-sm bg-gradient-gold py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground"
                  >
                    Contact Concierge
                  </Link>
                </div>
              ) : (
                <TicketCheckout
                  eventId={event.id}
                  eventTitle={event.title}
                  currency={event.currency}
                  fallbackCategories={getFallbackTicketCategoriesBySlug(event.slug)}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
