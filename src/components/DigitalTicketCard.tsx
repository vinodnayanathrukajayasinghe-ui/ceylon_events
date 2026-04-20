import { useEffect, useState } from "react";
import { CalendarDays, Download, Loader2, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type IssuedTicketRecord,
  createTicketQrDataUrl,
  downloadTicketPdf,
  verificationStateCopy,
} from "@/lib/tickets";

interface Props {
  ticket: IssuedTicketRecord;
  compact?: boolean;
  showActions?: boolean;
}

export function DigitalTicketCard({ ticket, compact = false, showActions = true }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;

    void createTicketQrDataUrl(ticket.qr_token).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl);
    });

    return () => {
      active = false;
    };
  }, [ticket.qr_token]);

  const state = verificationStateCopy[ticket.verification_status];

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-gold-soft bg-gradient-to-br from-charcoal via-onyx to-black shadow-gold">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-gold/75">
                Official Admission
              </p>
              <h3
                className={cn(
                  "mt-3 font-display text-3xl leading-[1.02] text-ivory md:text-4xl",
                  compact && "text-2xl md:text-3xl",
                )}
              >
                {ticket.events?.title || "Event Ticket"}
              </h3>
              <p className="mt-2 text-sm text-ivory/70">{ticket.ticket_categories?.name}</p>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em]",
                state.tone,
              )}
            >
              <ShieldCheck size={12} />
              {state.label}
            </span>
          </div>

          <div className="mt-8 grid gap-4 text-sm text-ivory/82 md:grid-cols-2">
            <div className="rounded-2xl border border-gold-soft/50 bg-onyx/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold/70">Attendee</p>
              <p className="mt-2 font-display text-2xl text-ivory">{ticket.attendee_name}</p>
              <p className="mt-2 text-sm text-ivory/60">
                {ticket.attendee_email || ticket.purchaser_email}
              </p>
            </div>

            <div className="rounded-2xl border border-gold-soft/50 bg-onyx/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold/70">Ticket Code</p>
              <p className="mt-2 font-body text-lg font-semibold tracking-[0.18em] text-gold-bright">
                {ticket.ticket_code}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-ivory/55">
                {ticket.payment_status} payment
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-ivory/76 md:grid-cols-3">
            <div className="rounded-2xl border border-gold-soft/40 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70">Event Date</p>
              <p className="mt-2 flex items-start gap-2">
                <CalendarDays size={15} className="mt-0.5 text-gold" />
                <span>
                  {ticket.events?.event_date
                    ? new Date(ticket.events.event_date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "TBA"}
                </span>
              </p>
              {ticket.events?.event_time && (
                <p className="mt-2 text-xs text-ivory/55">{ticket.events.event_time}</p>
              )}
            </div>

            <div className="rounded-2xl border border-gold-soft/40 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70">Venue</p>
              <p className="mt-2 flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 text-gold" />
                <span>{ticket.events?.venue || "Venue to be confirmed"}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-gold-soft/40 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70">Order Value</p>
              <p className="mt-2 font-display text-2xl text-gradient-gold">
                {ticket.currency} {Number(ticket.unit_price).toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-ivory/55">
                Purchaser: {ticket.purchaser_name}
              </p>
            </div>
          </div>

          {showActions && (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/my-tickets/$ticketCode"
                params={{ ticketCode: ticket.ticket_code }}
                className="inline-flex items-center gap-2 rounded-sm border border-gold px-5 py-3 text-xs uppercase tracking-[0.22em] text-gold transition-all hover:bg-gold hover:text-primary-foreground"
              >
                <Ticket size={14} />
                View Ticket
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await downloadTicketPdf(ticket);
                  } catch (error) {
                    console.error("Failed to download ticket PDF", error);
                    toast.error("Ticket download failed. Please try again in a moment.");
                  } finally {
                    setDownloading(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-5 py-3 text-xs uppercase tracking-[0.22em] text-primary-foreground transition-all hover:shadow-gold-lg"
              >
                {downloading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                Download Ticket
              </button>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col items-center justify-center border-l border-gold-soft/50 bg-gradient-to-b p-6",
            state.panelTone,
          )}
        >
          <div className="rounded-[1.25rem] border border-gold-soft bg-onyx/90 p-4 shadow-gold">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR code for ${ticket.ticket_code}`} className="h-40 w-40" />
            ) : (
              <div className="grid h-40 w-40 place-items-center">
                <Loader2 className="animate-spin text-gold" />
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.34em] text-ivory/60">
            Admin QR Verification
          </p>
          <p className="mt-2 text-center text-xs text-ivory/65">
            Present this ticket at the gate for secure validation and check-in.
          </p>
        </div>
      </div>
    </div>
  );
}
