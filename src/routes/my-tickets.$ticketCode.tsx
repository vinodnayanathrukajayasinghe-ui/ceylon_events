import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { DigitalTicketCard } from "@/components/DigitalTicketCard";
import { useAuth } from "@/lib/auth";
import type { IssuedTicketRecord } from "@/lib/tickets";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/my-tickets/$ticketCode")({
  head: ({ params }) => ({
    meta: [
      { title: `Ticket ${params.ticketCode} | Ceylon Kandy Events` },
      { name: "description", content: "Official digital ticket with secure QR verification." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MyTicketPage,
});

function MyTicketPage() {
  const { ticketCode } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<IssuedTicketRecord | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login",
        search: { redirect: `/my-tickets/${ticketCode}` } as never,
      });
    }
  }, [loading, navigate, ticketCode, user]);

  useEffect(() => {
    if (!user) return;

    setPageLoading(true);

    void (supabase as any)
      .from("issued_tickets")
      .select(
        `
          *,
          events(id, slug, title, event_date, event_time, venue),
          ticket_categories(id, name),
          ticket_orders(order_reference, created_at),
          ticket_checkins(checked_in_at, source)
        `,
      )
      .eq("ticket_code", ticketCode.toUpperCase())
      .maybeSingle()
      .then(({ data, error }: { data: IssuedTicketRecord | null; error: Error | null }) => {
        if (error) {
          console.error("Failed to load issued ticket", error);
        }

        setTicket(data);
        setPageLoading(false);
      });
  }, [ticketCode, user]);

  if (loading || pageLoading) {
    return (
      <SiteLayout>
        <div className="container-luxe grid min-h-[70vh] place-items-center">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-gold" />
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold/70">Loading Ticket</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!ticket) {
    throw notFound();
  }

  return (
    <SiteLayout>
      <section className="pb-24 pt-28">
        <div className="container-luxe">
          <Link
            to="/my-bookings"
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold transition-all hover:gap-3"
          >
            <ArrowLeft size={14} />
            Back to My Bookings
          </Link>

          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.42em] text-gold/75">Digital Ticket</p>
            <h1 className="mt-3 font-display text-5xl text-ivory md:text-6xl">
              Your Official Event Admission
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ivory/72">
              Present this secure ticket at the venue entrance. The QR code is validated live against
              the event database and check-in history.
            </p>
          </div>

          <DigitalTicketCard ticket={ticket} showActions />
        </div>
      </section>
    </SiteLayout>
  );
}
