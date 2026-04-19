import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import heroGala from "@/assets/hero-gala.jpg";

export interface TicketCategoryFallback {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  sort_order?: number | null;
}

type EventCatalogEntry = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  city: string;
  base_price: number;
  currency: string;
  status: string;
  banner_url: string;
  category: string;
  ticket_categories?: TicketCategoryFallback[];
};

type EventLike = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  short_description?: string | null;
  description?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  venue?: string | null;
  city?: string | null;
  base_price?: number | null;
  currency?: string | null;
  status?: string | null;
  banner_url?: string | null;
  category?: string | null;
};

const ASSET_BY_SOURCE: Record<string, string> = {
  "/src/assets/gallery-1.jpg": gallery1,
  "/src/assets/gallery-2.jpg": gallery2,
  "/src/assets/gallery-3.jpg": gallery3,
  "/src/assets/gallery-4.jpg": gallery4,
  "/src/assets/gallery-5.jpg": gallery5,
  "/src/assets/gallery-6.jpg": gallery6,
  "/src/assets/hero-gala.jpg": heroGala,
};

export const EVENT_CATALOG: Record<string, EventCatalogEntry> = {
  "luxury-brand-launch": {
    id: "84b54707-aad9-4647-bf3e-df74963df10a",
    slug: "luxury-brand-launch",
    title: "Maison Or - Brand Launch",
    short_description: "The unveiling of a new luxury fashion house in Dubai.",
    description:
      "An invite-style launch reimagined for Dubai. Expect a polished runway reveal, champagne lounge moments, celebrity arrivals, and a guest list shaped around tastemakers, press, and VIP buyers.",
    event_date: "2025-12-05",
    event_time: "9:00 PM",
    venue: "One&Only The Palm",
    city: "Dubai",
    base_price: 450,
    currency: "AED",
    status: "upcoming",
    banner_url: gallery5,
    category: "Brand Launch",
    ticket_categories: [
      {
        id: "a9c9ed5f-274a-4c46-9974-93f977a668c5",
        name: "Standard",
        description: "General admission with welcome reception",
        price: 450,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "4a09cd39-b9f7-4fe7-91c6-4486386abf06",
        name: "VIP",
        description: "Priority access, premium seating and open bar",
        price: 950,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 2,
      },
      {
        id: "52ba113f-3f42-4b1b-9aa9-e308beb9a8ff",
        name: "Royal Table",
        description: "Private table for 6, dedicated host and champagne service",
        price: 4800,
        quantity_total: 12,
        quantity_sold: 0,
        sort_order: 3,
      },
    ],
  },
  "royal-gala-night-2025": {
    id: "9cf46190-079b-4ce2-b59a-e46715c7ab55",
    slug: "royal-gala-night-2025",
    title: "Royal Gala Night 2025",
    short_description: "An exclusive black-tie evening of luxury, music, and Dubai's finest hospitality.",
    description:
      "Step into a world of opulence at Royal Gala Night 2025. The evening is curated for Dubai's most discerning guests, with world-class entertainment, a six-course gourmet experience, live performances, and an after-hours lounge finale.",
    event_date: "2025-12-20",
    event_time: "7:00 PM onwards",
    venue: "Atlantis The Palm, Grand Ballroom",
    city: "Dubai",
    base_price: 850,
    currency: "AED",
    status: "upcoming",
    banner_url: heroGala,
    category: "Gala",
    ticket_categories: [
      {
        id: "31ecd3cd-9957-4200-b602-3ee580f1520f",
        name: "Standard",
        description: "General admission with full access to the event",
        price: 850,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "2ce19f48-1c95-4293-9419-bec4865e4035",
        name: "Premium",
        description: "Reserved premium seating with welcome drink",
        price: 1360,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 2,
      },
      {
        id: "68113bb3-c195-4504-95d2-6acee32ac081",
        name: "VIP",
        description: "VIP table, dedicated host, premium bar package",
        price: 2125,
        quantity_total: 30,
        quantity_sold: 0,
        sort_order: 3,
      },
    ],
  },
  "new-year-rooftop-2026": {
    id: "2257ec3c-ab8c-4079-93cd-079eaac7c2ef",
    slug: "new-year-rooftop-2026",
    title: "New Year Rooftop 2026",
    short_description: "Ring in 2026 with Dubai's most exclusive rooftop celebration.",
    description:
      "A premium rooftop celebration overlooking the city's fireworks. International DJs, curated cocktails, midnight champagne service, and skyline views define the countdown experience.",
    event_date: "2025-12-31",
    event_time: "9:00 PM till late",
    venue: "SLS Dubai, Privilege Rooftop",
    city: "Dubai",
    base_price: 950,
    currency: "AED",
    status: "sold_out",
    banner_url: gallery4,
    category: "Party",
    ticket_categories: [
      {
        id: "f022bb23-fc6f-4882-8d29-775a21d1d014",
        name: "Standard",
        description: "General admission with full access to the event",
        price: 950,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "5a95ea47-6454-4c83-91ac-5d2d79d8c014",
        name: "Premium",
        description: "Reserved premium seating with welcome drink",
        price: 1520,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 2,
      },
      {
        id: "1a018c2a-d956-4ec2-bab1-a371f623eaa7",
        name: "VIP",
        description: "VIP table, dedicated host, premium bar package",
        price: 2375,
        quantity_total: 30,
        quantity_sold: 0,
        sort_order: 3,
      },
    ],
  },
  "desert-stars-concert": {
    id: "5f76d888-c48a-4a2c-a23d-d260733cca15",
    slug: "desert-stars-concert",
    title: "Desert Stars - Live in Concert",
    short_description: "A spectacular open-air concert under the Dubai desert sky.",
    description:
      "A one-night-only desert concert experience with international artists, immersive stagecraft, gourmet dining stations, and premium lounge seating beneath the Arabian night sky.",
    event_date: "2026-01-18",
    event_time: "8:00 PM",
    venue: "Al Marmoom Desert, Dubai",
    city: "Dubai",
    base_price: 450,
    currency: "AED",
    status: "upcoming",
    banner_url: gallery2,
    category: "Concert",
    ticket_categories: [
      {
        id: "11636020-9ac9-42d7-b455-99c398d858e4",
        name: "Standard",
        description: "General admission with full access to the event",
        price: 450,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "28fd05aa-cb56-413c-84e8-ea01a2498f9f",
        name: "Premium",
        description: "Reserved premium seating with welcome drink",
        price: 720,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 2,
      },
      {
        id: "486a6e10-fe2c-47ee-a975-3706d093097f",
        name: "VIP",
        description: "VIP table, dedicated host, premium bar package",
        price: 1125,
        quantity_total: 30,
        quantity_sold: 0,
        sort_order: 3,
      },
    ],
  },
  "bollywood-night-vol-vii": {
    id: "e13d1b45-b0a9-4d2d-a524-f0027fc0c333",
    slug: "bollywood-night-vol-vii",
    title: "Bollywood Night Vol. VII",
    short_description: "A cinematic Bollywood evening with live performers and superstar guest appearances.",
    description:
      "Bollywood Night Vol. VII brings live dhol, dance ensembles, cinematic production design, and a premium fine-dining experience into one high-energy celebration at arena scale.",
    event_date: "2026-02-14",
    event_time: "7:00 PM",
    venue: "Coca-Cola Arena",
    city: "Dubai",
    base_price: 350,
    currency: "AED",
    status: "upcoming",
    banner_url: gallery6,
    category: "Concert",
    ticket_categories: [
      {
        id: "57d36e8a-7376-4e6c-bb78-19a1ba012dad",
        name: "Standard",
        description: "General access, welcome drink, dinner buffet.",
        price: 350,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 0,
      },
      {
        id: "867f72eb-8376-48cc-8d0b-71168390161b",
        name: "VIP",
        description: "Front-stage seating, premium bar, valet parking.",
        price: 700,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "f53086d4-5d56-462a-bfa1-9b945817dc33",
        name: "Royal Table",
        description: "Private table for 6, dedicated host, champagne service.",
        price: 1400,
        quantity_total: 20,
        quantity_sold: 0,
        sort_order: 2,
      },
    ],
  },
  "platinum-wedding-showcase": {
    id: "254f0d37-6ad1-4608-946e-cd283b18bf43",
    slug: "platinum-wedding-showcase",
    title: "Platinum Wedding Showcase",
    short_description: "Inspiration evening for couples planning a luxury Dubai wedding.",
    description:
      "Meet Dubai's top wedding designers, planners, florists, couture houses, and entertainment partners in a curated showcase built for couples designing a truly premium celebration.",
    event_date: "2026-02-14",
    event_time: "6:00 PM",
    venue: "Burj Al Arab, Skyview",
    city: "Dubai",
    base_price: 250,
    currency: "AED",
    status: "upcoming",
    banner_url: gallery1,
    category: "Wedding",
    ticket_categories: [
      {
        id: "f4837f0d-ab7a-4940-9b7a-a8fdea2929f9",
        name: "Standard",
        description: "General admission with full access to the event",
        price: 250,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "2e907606-9588-46ac-802c-6e9e3515f81e",
        name: "Premium",
        description: "Reserved premium seating with welcome drink",
        price: 400,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 2,
      },
      {
        id: "55469b63-5fee-417a-9810-d2b633e0cb88",
        name: "VIP",
        description: "VIP table, dedicated host, premium bar package",
        price: 625,
        quantity_total: 30,
        quantity_sold: 0,
        sort_order: 3,
      },
    ],
  },
  "corporate-summit-dubai": {
    id: "72f59931-e916-43b6-84ad-8192d3ddeb0e",
    slug: "corporate-summit-dubai",
    title: "Dubai Leaders Summit",
    short_description: "A premium networking and keynote evening for C-level executives.",
    description:
      "A refined executive summit featuring keynote sessions, hosted conversations, premium networking moments, and hospitality tailored for senior leadership and invited business circles.",
    event_date: "2026-03-08",
    event_time: "6:30 PM",
    venue: "Address Downtown, Sky Lounge",
    city: "Dubai",
    base_price: 1200,
    currency: "AED",
    status: "upcoming",
    banner_url: gallery3,
    category: "Corporate",
    ticket_categories: [
      {
        id: "0e9869a2-1cc4-420e-a800-1b5f94605a02",
        name: "Standard",
        description: "General admission with full access to the event",
        price: 1200,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "037f4d64-fed5-41ea-8b9d-1cec0d8f96b8",
        name: "Premium",
        description: "Reserved premium seating with welcome drink",
        price: 1920,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 2,
      },
      {
        id: "b776fe4f-e8be-4cbc-9020-d8f0a144fef7",
        name: "VIP",
        description: "VIP table, dedicated host, premium bar package",
        price: 3000,
        quantity_total: 30,
        quantity_sold: 0,
        sort_order: 3,
      },
    ],
  },
  "vogue-soiree-spring": {
    id: "28fe7dbb-86a7-400d-a2ad-172067e6ccf2",
    slug: "vogue-soiree-spring",
    title: "Vogue Soiree - Spring",
    short_description: "An invitation-only fashion evening with Dubai's most discerning circle.",
    description:
      "Runway presentations, a champagne reception, editorial-grade styling, and an intimate afterparty shape this invitation-only fashion evening inspired by Dubai's couture scene.",
    event_date: "2026-03-08",
    event_time: "7:30 PM",
    venue: "Burj Al Arab Skyview",
    city: "Dubai",
    base_price: 450,
    currency: "AED",
    status: "upcoming",
    banner_url: gallery5,
    category: "Fashion",
    ticket_categories: [
      {
        id: "0bfbbf52-591c-482d-8e9e-3cbe26ad169e",
        name: "Standard",
        description: "General admission with welcome reception",
        price: 450,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "8f98b791-54c7-459f-b144-993a4180a21a",
        name: "VIP",
        description: "Priority access, premium seating and open bar",
        price: 950,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 2,
      },
      {
        id: "1282fce5-109d-4e6f-be23-ad49dca9371a",
        name: "Royal Table",
        description: "Private table for 6, dedicated host and champagne service",
        price: 4800,
        quantity_total: 12,
        quantity_sold: 0,
        sort_order: 3,
      },
    ],
  },
  "ramadan-iftar-majlis": {
    id: "20efc5c1-a464-44f3-b72c-fec5c84c6897",
    slug: "ramadan-iftar-majlis",
    title: "Royal Ramadan Iftar Majlis",
    short_description: "A serene majlis evening with traditional iftar, oud, and reflective company.",
    description:
      "Hosted in a refined Emirati-inspired setting, this majlis evening combines a traditional iftar spread, live oud and qanun, elegant desert hospitality, and a calm luxury atmosphere.",
    event_date: "2026-03-15",
    event_time: "6:15 PM",
    venue: "Bab Al Shams Resort",
    city: "Dubai",
    base_price: 280,
    currency: "AED",
    status: "upcoming",
    banner_url: gallery6,
    category: "Cultural",
    ticket_categories: [
      {
        id: "4896c4a0-c74d-405f-b8aa-cdb4fb951a0f",
        name: "Standard",
        description: "General access, welcome drink, dinner buffet.",
        price: 280,
        quantity_total: 200,
        quantity_sold: 0,
        sort_order: 0,
      },
      {
        id: "28856ef9-0ca5-42da-b484-f139ffa500e4",
        name: "VIP",
        description: "Front-stage seating, premium bar, valet parking.",
        price: 560,
        quantity_total: 80,
        quantity_sold: 0,
        sort_order: 1,
      },
      {
        id: "51b26be5-ff61-4f8d-a36f-0395f33158d0",
        name: "Royal Table",
        description: "Private table for 6, dedicated host, champagne service.",
        price: 1120,
        quantity_total: 20,
        quantity_sold: 0,
        sort_order: 2,
      },
    ],
  },
};

function getCatalogEntry(slug?: string | null) {
  return slug ? EVENT_CATALOG[slug] : undefined;
}

function normalizeBannerUrl(event: EventLike): string {
  const mapped = getCatalogEntry(event.slug)?.banner_url;
  const bannerUrl = event.banner_url?.trim();

  if (!bannerUrl) return mapped ?? gallery1;
  if (bannerUrl in ASSET_BY_SOURCE) return ASSET_BY_SOURCE[bannerUrl];
  if (/^https?:\/\//i.test(bannerUrl) || bannerUrl.startsWith("data:")) return bannerUrl;

  return mapped ?? gallery1;
}

function buildDescription(event: EventLike, fallback?: Partial<EventCatalogEntry>) {
  if (event.description?.trim()) return event.description.trim();
  if (fallback?.description?.trim()) return fallback.description.trim();
  if (event.short_description?.trim()) return event.short_description.trim();
  if (fallback?.short_description?.trim()) return fallback.short_description.trim();
  return "A signature Ceylon Kandy Events experience curated with premium production, hospitality, and unforgettable atmosphere.";
}

export function normalizeEvent<T extends EventLike>(event: T): T & {
  id: string;
  banner_url: string;
  short_description: string;
  description: string;
  currency: string;
  city: string;
  category: string;
  event_time: string;
  base_price: number;
  status: string;
  venue: string;
  title: string;
  event_date: string;
} {
  const fallback = getCatalogEntry(event.slug);

  return {
    ...event,
    id: event.id || fallback?.id || "",
    title: event.title || fallback?.title || "Exclusive Event",
    banner_url: normalizeBannerUrl(event),
    short_description:
      event.short_description?.trim() ||
      fallback?.short_description ||
      "An elevated luxury event experience by Ceylon Kandy Events.",
    description: buildDescription(event, fallback),
    currency: event.currency || fallback?.currency || "AED",
    city: event.city || fallback?.city || "Dubai",
    category: event.category || fallback?.category || "Premium Event",
    event_time: event.event_time || fallback?.event_time || "To be announced",
    base_price: event.base_price ?? fallback?.base_price ?? 0,
    status: event.status || fallback?.status || "upcoming",
    venue: event.venue || fallback?.venue || "Dubai",
    event_date: event.event_date || fallback?.event_date || new Date().toISOString().slice(0, 10),
  };
}

export function getFallbackEventBySlug(slug: string) {
  const entry = getCatalogEntry(slug);
  return entry ? normalizeEvent(entry) : null;
}

export function getFallbackEvents() {
  return Object.values(EVENT_CATALOG)
    .map((event) => normalizeEvent(event))
    .sort((left, right) => left.event_date.localeCompare(right.event_date));
}

export function getFallbackTicketCategoriesByEventId(eventId: string) {
  return Object.values(EVENT_CATALOG).find((event) => event.id === eventId)?.ticket_categories ?? [];
}

export function getFallbackTicketCategoriesBySlug(slug: string) {
  return getCatalogEntry(slug)?.ticket_categories ?? [];
}

export function getFallbackEventImage(event: EventLike) {
  return normalizeBannerUrl(event);
}
