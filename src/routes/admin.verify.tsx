import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, QrCode, ScanLine, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractTicketLookup, type TicketVerificationResult } from "@/lib/tickets";

export const Route = createFileRoute("/admin/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: AdminVerifyPage,
});

const EMPTY_RESULT: TicketVerificationResult = {
  valid: false,
  payment_confirmed: false,
  event_match: false,
  ticket_id: null,
  ticket_code: null,
  order_reference: null,
  event_id: null,
  event_name: null,
  event_date: null,
  event_time: null,
  venue: null,
  attendee_name: null,
  attendee_email: null,
  purchaser_name: null,
  purchaser_email: null,
  ticket_tier: null,
  status: "invalid",
  payment_status: null,
  is_used: false,
  is_cancelled: false,
  checked_in_at: null,
  checked_in_by: null,
  purchase_date: null,
  issued_at: null,
  total_amount: null,
  unit_price: null,
  currency: null,
  checkin_count: 0,
  message: "",
};

function AdminVerifyPage() {
  const search = Route.useSearch();
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [eventFilter, setEventFilter] = useState("all");
  const [lookup, setLookup] = useState(search.token || "");
  const [verifying, setVerifying] = useState(false);
  const [scannerOn, setScannerOn] = useState(false);
  const [result, setResult] = useState<TicketVerificationResult | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    void supabase
      .from("events")
      .select("id, title")
      .order("event_date", { ascending: true })
      .then(({ data }) => setEvents((data || []) as Array<{ id: string; title: string }>));
  }, []);

  const verifyLookup = async (rawValue: string) => {
    const parsedLookup = extractTicketLookup(rawValue);
    if (!parsedLookup) {
      toast.error("Scan or enter a ticket code / QR token.");
      return;
    }

    setLookup(parsedLookup);
    setVerifying(true);

    const { data, error } = await (supabase as any).rpc("admin_verify_ticket", {
      _lookup: parsedLookup,
      _event_id: eventFilter === "all" ? null : eventFilter,
    });

    setVerifying(false);

    if (error) {
      toast.error(error.message);
      setResult({ ...EMPTY_RESULT, message: error.message });
      return;
    }

    const nextResult = ((data || [EMPTY_RESULT])[0] || EMPTY_RESULT) as TicketVerificationResult;
    setResult(nextResult);
  };

  const markCheckIn = async () => {
    if (!lookup) return;

    setVerifying(true);
    const { data, error } = await (supabase as any).rpc("admin_check_in_ticket", {
      _lookup: lookup,
      _event_id: eventFilter === "all" ? null : eventFilter,
      _source: "camera_or_manual",
    });
    setVerifying(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const nextResult = ((data || [EMPTY_RESULT])[0] || EMPTY_RESULT) as TicketVerificationResult;
    setResult(nextResult);
    toast.success(
      nextResult.status === "used"
        ? "Ticket checked in successfully."
        : nextResult.message || "Check-in could not be completed.",
    );
  };

  useEffect(() => {
    if (!search.token) return;
    void verifyLookup(search.token);
  }, [search.token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!scannerOn || typeof window === "undefined") {
      return;
    }

    let stopped = false;
    let html5Qr: any;

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (stopped) return;

      html5Qr = new Html5Qrcode("ticket-verifier-scanner");
      scannerRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText: string) => {
          const parsedLookup = extractTicketLookup(decodedText);
          setScannerOn(false);
          await html5Qr.stop().catch(() => null);
          await verifyLookup(parsedLookup);
        },
        () => null,
      );
    };

    void startScanner().catch((error: Error) => {
      console.error("Failed to start ticket scanner", error);
      toast.error("Camera access failed. Manual verification is still available.");
      setScannerOn(false);
    });

    return () => {
      stopped = true;
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop().catch(() => null);
      }
      scannerRef.current = null;
    };
  }, [scannerOn]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Verification Scanner</p>
        <h1 className="mt-2 font-display text-4xl text-ivory">Gate Validation</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          Scan a QR code or enter a ticket code to validate originality, payment status, event
          match, and duplicate usage in real time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gold-soft bg-charcoal p-5">
          <div className="space-y-4">
            <select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              className="w-full border border-gold-soft bg-onyx px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
            >
              <option value="all">Verify against any event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>

            <div className="rounded-2xl border border-gold-soft/50 bg-onyx/70 p-4">
              <div className="mb-4 flex items-center gap-3">
                <QrCode className="text-gold" size={18} />
                <p className="text-sm font-medium text-ivory">Camera Scanner</p>
              </div>
              <button
                type="button"
                onClick={() => setScannerOn((current) => !current)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-gold px-4 py-3 text-xs uppercase tracking-[0.24em] text-primary-foreground"
              >
                <Camera size={14} />
                {scannerOn ? "Stop Scanner" : "Start Camera Scan"}
              </button>
              <div
                id="ticket-verifier-scanner"
                className={`mt-4 overflow-hidden rounded-2xl border border-gold-soft bg-black ${
                  scannerOn ? "min-h-[260px]" : "grid min-h-[120px] place-items-center"
                }`}
              >
                {!scannerOn && (
                  <div className="px-4 text-center text-sm text-muted-foreground">
                    Mobile camera scanning is available here for fast venue check-in.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gold-soft/50 bg-onyx/70 p-4">
              <p className="mb-4 text-sm font-medium text-ivory">Manual Lookup</p>
              <div className="space-y-3">
                <input
                  value={lookup}
                  onChange={(event) => setLookup(event.target.value)}
                  placeholder="Ticket code, QR token, or scanned URL"
                  className="w-full border border-gold-soft bg-black/20 px-4 py-3 text-sm text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => void verifyLookup(lookup)}
                  disabled={verifying}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-gold px-4 py-3 text-xs uppercase tracking-[0.24em] text-gold transition-all hover:bg-gold hover:text-primary-foreground disabled:opacity-60"
                >
                  {verifying ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                  Verify Ticket
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gold-soft bg-charcoal p-6">
          {!result ? (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <ScanLine className="mx-auto text-gold" size={36} />
                <p className="mt-4 font-display text-3xl text-ivory">Ready to Validate</p>
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                  Use the scanner or manual lookup to confirm a ticket is original, paid, and
                  unused before entry.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className={`rounded-2xl border bg-gradient-to-br p-6 ${
                  result.status === "unused"
                    ? "border-gold/60 from-gold/15 to-transparent"
                    : result.status === "used"
                      ? "border-amber-400/40 from-amber-500/15 to-transparent"
                      : "border-red-500/40 from-red-500/15 to-transparent"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.36em] text-gold/75">
                      Verification Result
                    </p>
                    <h2 className="mt-3 font-display text-4xl text-ivory">
                      {result.status === "unused"
                        ? "VALID TICKET"
                        : result.status === "used"
                          ? "ALREADY USED"
                          : result.status === "pending_payment"
                            ? "PAYMENT PENDING"
                            : result.status === "cancelled"
                              ? "CANCELLED"
                              : "INVALID"}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm text-ivory/72">{result.message}</p>
                  </div>
                  <div className="grid place-items-center rounded-full border border-gold-soft bg-onyx/70 p-4 text-gold">
                    {result.status === "unused" ? (
                      <CheckCircle2 size={28} />
                    ) : (
                      <ShieldAlert size={28} />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailCard label="Ticket Code" value={result.ticket_code || "—"} />
                <DetailCard label="Order Reference" value={result.order_reference || "—"} />
                <DetailCard label="Event" value={result.event_name || "—"} />
                <DetailCard label="Tier" value={result.ticket_tier || "—"} />
                <DetailCard label="Attendee" value={result.attendee_name || "—"} />
                <DetailCard label="Payment" value={result.payment_status || "—"} />
                <DetailCard label="Venue" value={result.venue || "—"} />
                <DetailCard
                  label="Purchase Date"
                  value={
                    result.purchase_date
                      ? new Date(result.purchase_date).toLocaleString("en-GB")
                      : "—"
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatPill title="Original Record" value={result.valid ? "Yes" : "No"} />
                <StatPill title="Payment Confirmed" value={result.payment_confirmed ? "Yes" : "No"} />
                <StatPill title="Event Match" value={result.event_match ? "Yes" : "No"} />
              </div>

              {result.checked_in_at && (
                <div className="rounded-2xl border border-gold-soft/50 bg-onyx/70 p-5">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-gold/70">Check-In History</p>
                  <p className="mt-3 text-sm text-ivory">
                    Checked in {new Date(result.checked_in_at).toLocaleString("en-GB")}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Scan count: {result.checkin_count}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void markCheckIn()}
                  disabled={
                    verifying ||
                    result.status !== "unused" ||
                    !result.payment_confirmed ||
                    !result.event_match
                  }
                  className="inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-6 py-3 text-xs uppercase tracking-[0.24em] text-primary-foreground disabled:opacity-50"
                >
                  {verifying ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                  Mark Checked In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLookup("");
                    setResult(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-sm border border-gold-soft px-6 py-3 text-xs uppercase tracking-[0.24em] text-ivory/80 transition-all hover:border-gold hover:text-gold"
                >
                  Clear Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gold-soft/50 bg-onyx/70 p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70">{label}</p>
      <p className="mt-2 text-sm text-ivory">{value}</p>
    </div>
  );
}

function StatPill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-full border border-gold-soft/50 bg-onyx/70 px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold/70">{title}</p>
      <p className="mt-2 font-body text-sm font-semibold text-ivory">{value}</p>
    </div>
  );
}
