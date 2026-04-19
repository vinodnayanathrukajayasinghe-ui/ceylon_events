import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CheckinRecord {
  id: string;
  checked_in_at: string;
  source: string;
  notes: string | null;
  issued_tickets?: {
    ticket_code?: string;
    attendee_name?: string;
    purchaser_email?: string;
    ticket_orders?: {
      order_reference?: string;
    } | null;
    events?: {
      title?: string;
    } | null;
    ticket_categories?: {
      name?: string;
    } | null;
  } | null;
}

export const Route = createFileRoute("/admin/checkins")({
  component: AdminCheckinsPage,
});

function AdminCheckinsPage() {
  const [items, setItems] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void (supabase as any)
      .from("ticket_checkins")
      .select(
        `
          *,
          issued_tickets(
            ticket_code,
            attendee_name,
            purchaser_email,
            ticket_orders(order_reference),
            events(title),
            ticket_categories(name)
          )
        `,
      )
      .order("checked_in_at", { ascending: false })
      .then(({ data }: { data: CheckinRecord[] }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const ticket = item.issued_tickets;
      return (
        (ticket?.ticket_code || "").toLowerCase().includes(normalizedQuery) ||
        (ticket?.attendee_name || "").toLowerCase().includes(normalizedQuery) ||
        (ticket?.purchaser_email || "").toLowerCase().includes(normalizedQuery) ||
        (ticket?.events?.title || "").toLowerCase().includes(normalizedQuery) ||
        (ticket?.ticket_orders?.order_reference || "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [items, query]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Check-In Logs</p>
        <h1 className="mt-2 font-display text-4xl text-ivory">Venue Entry Audit</h1>
      </div>

      <div className="rounded-2xl border border-gold-soft bg-charcoal p-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by attendee, ticket code, order ref, or event"
          className="w-full border border-gold-soft bg-onyx px-4 py-3 text-sm text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold-soft bg-charcoal">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="border-b border-gold-soft bg-onyx">
              <tr className="text-left text-[10px] uppercase tracking-[0.3em] text-gold">
                <th className="p-4">Ticket</th>
                <th className="p-4">Attendee</th>
                <th className="p-4">Event</th>
                <th className="p-4">Source</th>
                <th className="p-4">Checked In</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No check-ins recorded yet.
                  </td>
                </tr>
              )}
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-gold-soft/40 hover:bg-onyx/40">
                  <td className="p-4">
                    <p className="font-body text-xs font-semibold tracking-[0.18em] text-gold-bright">
                      {item.issued_tickets?.ticket_code}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.issued_tickets?.ticket_orders?.order_reference}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-ivory">{item.issued_tickets?.attendee_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.issued_tickets?.purchaser_email}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-ivory">{item.issued_tickets?.events?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.issued_tickets?.ticket_categories?.name}
                    </p>
                  </td>
                  <td className="p-4 text-ivory/80">{item.source}</td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(item.checked_in_at).toLocaleString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
