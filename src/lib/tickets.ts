import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import logo from "@/assets/logo-header.png";
import { SITE } from "@/lib/site";

export type TicketVerificationStatus =
  | "pending_payment"
  | "unused"
  | "used"
  | "cancelled"
  | "invalid";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface TicketVerificationResult {
  valid: boolean;
  payment_confirmed: boolean;
  event_match: boolean;
  ticket_id: string | null;
  ticket_code: string | null;
  order_reference: string | null;
  event_id: string | null;
  event_name: string | null;
  event_date: string | null;
  event_time: string | null;
  venue: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  purchaser_name: string | null;
  purchaser_email: string | null;
  ticket_tier: string | null;
  status: TicketVerificationStatus;
  payment_status: PaymentStatus | null;
  is_used: boolean;
  is_cancelled: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  purchase_date: string | null;
  issued_at: string | null;
  total_amount: number | string | null;
  unit_price: number | string | null;
  currency: string | null;
  checkin_count: number;
  message: string;
}

export interface IssuedTicketRecord {
  id: string;
  order_id: string;
  ticket_code: string;
  qr_token: string;
  attendee_name: string;
  attendee_email: string | null;
  attendee_phone: string | null;
  purchaser_name: string;
  purchaser_email: string;
  purchaser_phone: string;
  unit_price: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  verification_status: TicketVerificationStatus;
  issued_at: string | null;
  checked_in_at: string | null;
  is_used: boolean;
  is_cancelled: boolean;
  created_at?: string;
  events?: {
    id?: string;
    slug?: string;
    title?: string;
    event_date?: string;
    event_time?: string | null;
    venue?: string;
  } | null;
  ticket_categories?: {
    id?: string;
    name?: string;
  } | null;
  ticket_checkins?: Array<{
    checked_in_at?: string;
    source?: string;
  }>;
  ticket_orders?: {
    order_reference?: string;
    created_at?: string;
  } | null;
}

export const verificationStateCopy: Record<
  TicketVerificationStatus,
  { label: string; tone: string; panelTone: string }
> = {
  unused: {
    label: "Valid Ticket",
    tone: "border-gold text-gold",
    panelTone: "from-gold/15 to-gold/5",
  },
  used: {
    label: "Already Used",
    tone: "border-amber-400/50 text-amber-200",
    panelTone: "from-amber-500/15 to-amber-500/5",
  },
  cancelled: {
    label: "Cancelled",
    tone: "border-red-500/50 text-red-300",
    panelTone: "from-red-500/15 to-red-500/5",
  },
  pending_payment: {
    label: "Payment Pending",
    tone: "border-ivory/20 text-ivory/75",
    panelTone: "from-white/10 to-white/5",
  },
  invalid: {
    label: "Invalid",
    tone: "border-red-500/50 text-red-300",
    panelTone: "from-red-500/15 to-red-500/5",
  },
};

export function getSiteOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return SITE.url;
}

export function buildTicketOwnerUrl(ticketCode: string) {
  return `${getSiteOrigin()}/my-tickets/${ticketCode}`;
}

export function buildTicketVerificationUrl(qrToken: string) {
  return `${getSiteOrigin()}/admin/verify?token=${encodeURIComponent(qrToken)}`;
}

export function extractTicketLookup(input: string) {
  const value = input.trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    const token = url.searchParams.get("token");
    if (token) return token.trim();

    const codeMatch = url.pathname.match(/\/my-tickets\/([^/?#]+)/i);
    if (codeMatch?.[1]) return codeMatch[1].trim().toUpperCase();
  } catch {
    // The value is not a URL. Fall through to raw parsing.
  }

  return value.startsWith("ckt_") ? value : value.toUpperCase();
}

export async function createTicketQrDataUrl(qrToken: string) {
  return QRCode.toDataURL(buildTicketVerificationUrl(qrToken), {
    errorCorrectionLevel: "M",
    margin: 1,
    color: {
      dark: "#d9b45a",
      light: "#0a0908",
    },
    width: 320,
  });
}

async function assetToDataUrl(assetUrl: string) {
  const response = await fetch(assetUrl);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) return "To be announced";

  return new Date(dateValue).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateValue?: string | null) {
  if (!dateValue) return "Pending";

  return new Date(dateValue).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function downloadTicketPdf(ticket: IssuedTicketRecord) {
  const [qrDataUrl, logoDataUrl] = await Promise.all([
    createTicketQrDataUrl(ticket.qr_token),
    assetToDataUrl(logo),
  ]);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [720, 340],
  });

  doc.setFillColor(10, 9, 8);
  doc.rect(0, 0, 720, 340, "F");

  doc.setDrawColor(217, 180, 90);
  doc.setLineWidth(1.2);
  doc.roundedRect(20, 20, 680, 300, 16, 16, "S");

  doc.setFillColor(217, 180, 90);
  doc.roundedRect(490, 20, 210, 300, 16, 16, "F");

  doc.addImage(logoDataUrl, "PNG", 38, 34, 120, 48);

  doc.setTextColor(217, 180, 90);
  doc.setFont("times", "italic");
  doc.setFontSize(15);
  doc.text("Official Admission Ticket", 40, 100);

  doc.setTextColor(245, 240, 232);
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.text(ticket.events?.title || "Ceylon Kandy Event", 40, 138, { maxWidth: 420 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(190, 186, 179);
  doc.text("Attendee", 40, 178);
  doc.text("Event Date", 40, 226);
  doc.text("Venue", 220, 226);
  doc.text("Ticket Tier", 40, 274);
  doc.text("Order Ref", 220, 274);

  doc.setTextColor(245, 240, 232);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(ticket.attendee_name, 40, 198);

  doc.setFontSize(14);
  doc.text(formatDate(ticket.events?.event_date), 40, 246, { maxWidth: 160 });
  doc.text(ticket.events?.venue || "Venue to be announced", 220, 246, { maxWidth: 230 });
  doc.text(ticket.ticket_categories?.name || "Ticket", 40, 294);
  doc.text(ticket.ticket_orders?.order_reference || ticket.order_id, 220, 294, { maxWidth: 230 });

  doc.setTextColor(10, 9, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SCAN TO VERIFY", 515, 54);

  doc.addImage(qrDataUrl, "PNG", 525, 78, 140, 140);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Ticket Code: ${ticket.ticket_code}`, 515, 246);
  doc.text(`Status: ${ticket.verification_status.replace("_", " ").toUpperCase()}`, 515, 264);
  doc.text(`Payment: ${ticket.payment_status.toUpperCase()}`, 515, 282);
  doc.text(
    `Issued: ${formatDateTime(ticket.issued_at || ticket.created_at || undefined)}`,
    515,
    300,
  );

  doc.save(`${ticket.ticket_code}.pdf`);
}
