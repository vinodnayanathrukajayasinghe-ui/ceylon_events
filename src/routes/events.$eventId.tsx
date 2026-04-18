import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, ArrowLeft, Ticket } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/site";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g4 from "@/assets/gallery-4.jpg";

export const Route = createFileRoute("/events/$eventId")({
  head: ({ params }) => ({
    meta: [
      { title: `Event — ${params.eventId.replace(/-/g, " ")} | Ceylon Kandy Events` },
      { name: "description", content: "Premium event details, venue, schedule and tickets." },
    ],
  }),
  component: EventDetailPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-5xl text-gradient-gold">Event Not Found</h1>
        <Link to="/events" className="mt-8 inline-block text-gold uppercase tracking-[0.3em] text-xs">← Back to Events</Link>
      </div>
    </SiteLayout>
  ),
});

const FALLBACK_BY_SLUG: Record<string, any> = {
  "royal-gala-night-2025": { title: "Royal Gala Night 2025", description: "An intimate evening of Dubai's most distinguished guests, hosted under chandeliers above the Palm. Live orchestra, six-course tasting menu and a midnight afterparty.", event_date: "2025-12-20", event_time: "8:00 PM onwards", venue: "Atlantis The Palm", city: "Dubai", base_price: 850, currency: "AED", banner_url: g1, status: "upcoming" },
  "desert-stars-concert": { title: "Desert Stars Concert", description: "World-class artists perform under the Arabian sky in a one-night-only desert experience. Includes camel arrival, dinner and after-show shisha lounge.", event_date: "2026-01-18", event_time: "6:30 PM gates", venue: "Al Marmoom Desert Conservation Reserve", city: "Dubai", base_price: 450, currency: "AED", banner_url: g2, status: "upcoming" },
  "new-year-rooftop-2026": { title: "New Year Rooftop 2026", description: "Dubai's most exclusive countdown above the city skyline. Premium open bar, international DJ lineup, fireworks and a midnight champagne moment.", event_date: "2025-12-31", event_time: "9:00 PM", venue: "SLS Dubai", city: "Dubai", base_price: 0, currency: "AED", banner_url: g4, status: "sold_out" },
};

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const [event, setEvent] = useState<any>(FALLBACK_BY_SLUG[eventId] ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("events").select("*").eq("slug", eventId).maybeSingle().then(({ data }) => {
      if (data) setEvent(data);
      setLoading(false);
    });
  }, [eventId]);

  if (!loading && !event) throw notFound();
  if (!event) return null;

  return (
    <SiteLayout>
      <div className="relative h-[60vh] min-h-[400px] -mt-20 pt-20 overflow-hidden">
        <img src={event.banner_url || g1} alt={event.title} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/60 to-onyx/30" />
        <div className="container-luxe relative z-10 h-full flex flex-col justify-end pb-12">
          <Link to="/events" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] text-gold uppercase mb-6 hover:gap-3 transition-all w-fit">
            <ArrowLeft size={14} /> All Events
          </Link>
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">{event.category || "Premium Event"}</p>
          <h1 className="font-display text-4xl md:text-7xl text-ivory leading-[1.05] max-w-4xl">{event.title}</h1>
        </div>
      </div>

      <section className="py-20">
        <div className="container-luxe grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl text-ivory mb-6">About this Event</h2>
            <p className="text-lg text-ivory/80 leading-relaxed whitespace-pre-line">{event.description || event.short_description}</p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              <div className="p-6 border border-gold-soft bg-charcoal">
                <Calendar size={20} className="text-gold mb-3" />
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-1">Date</p>
                <p className="text-ivory">{new Date(event.event_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="p-6 border border-gold-soft bg-charcoal">
                <Clock size={20} className="text-gold mb-3" />
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-1">Time</p>
                <p className="text-ivory">{event.event_time || "TBA"}</p>
              </div>
              <div className="p-6 border border-gold-soft bg-charcoal">
                <MapPin size={20} className="text-gold mb-3" />
                <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-1">Venue</p>
                <p className="text-ivory">{event.venue}</p>
                <p className="text-xs text-muted-foreground">{event.city}</p>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 self-start">
            <div className="border border-gold p-8 bg-gradient-to-b from-charcoal to-onyx">
              <p className="text-[10px] tracking-[0.4em] text-gold uppercase mb-3">Starting From</p>
              <p className="font-display text-5xl text-gradient-gold mb-6">
                {event.base_price && event.base_price > 0 ? `${event.currency} ${event.base_price}` : "Invitation Only"}
              </p>
              {event.status === "sold_out" ? (
                <button disabled className="w-full py-4 border border-gold text-gold uppercase tracking-[0.2em] text-xs cursor-not-allowed opacity-60">Sold Out</button>
              ) : (
                <Link to="/tickets" search={{ event: eventId } as never} className="w-full inline-flex items-center justify-center gap-2 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:shadow-gold-lg transition-all">
                  <Ticket size={14} /> Buy Tickets
                </Link>
              )}
              <a href={whatsappLink(`Hi, I'd like more info on ${event.title}`)} target="_blank" rel="noreferrer" className="mt-3 w-full inline-flex items-center justify-center py-4 border border-gold-soft text-ivory uppercase tracking-[0.2em] text-xs hover:border-gold hover:text-gold transition-all">
                Inquire on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
