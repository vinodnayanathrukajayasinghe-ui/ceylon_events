import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import heroGala from "@/assets/hero-gala.jpg";

type EventLike = {
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

const FALLBACK_BY_SLUG: Record<string, Partial<EventLike> & { banner_url: string }> = {
  "luxury-brand-launch": {
    short_description: "The unveiling of a new luxury fashion house in Dubai.",
    description:
      "An invite-style launch reimagined for Dubai. Expect a polished runway reveal, champagne lounge moments, celebrity arrivals, and a guest list shaped around tastemakers, press, and VIP buyers.",
    event_time: "9:00 PM",
    city: "Dubai",
    category: "Brand Launch",
    banner_url: gallery5,
  },
  "royal-gala-night-2025": {
    short_description: "An exclusive black-tie evening of luxury, music, and Dubai's finest hospitality.",
    description:
      "Step into a world of opulence at Royal Gala Night 2025. The evening is curated for Dubai's most discerning guests, with world-class entertainment, a six-course gourmet experience, live performances, and an after-hours lounge finale.",
    event_time: "7:00 PM onwards",
    city: "Dubai",
    category: "Gala",
    banner_url: heroGala,
  },
  "new-year-rooftop-2026": {
    short_description: "Ring in 2026 with Dubai's most exclusive rooftop celebration.",
    description:
      "A premium rooftop celebration overlooking the city's fireworks. International DJs, curated cocktails, midnight champagne service, and skyline views define the countdown experience.",
    event_time: "9:00 PM till late",
    city: "Dubai",
    category: "Party",
    banner_url: gallery4,
  },
  "desert-stars-concert": {
    short_description: "A spectacular open-air concert under the Dubai desert sky.",
    description:
      "A one-night-only desert concert experience with international artists, immersive stagecraft, gourmet dining stations, and premium lounge seating beneath the Arabian night sky.",
    event_time: "8:00 PM",
    city: "Dubai",
    category: "Concert",
    banner_url: gallery2,
  },
  "bollywood-night-vol-vii": {
    short_description: "A cinematic Bollywood evening with live performers and superstar guest appearances.",
    description:
      "Bollywood Night Vol. VII brings live dhol, dance ensembles, cinematic production design, and a premium fine-dining experience into one high-energy celebration at arena scale.",
    event_time: "7:00 PM",
    city: "Dubai",
    category: "Concert",
    banner_url: gallery6,
  },
  "platinum-wedding-showcase": {
    short_description: "Inspiration evening for couples planning a luxury Dubai wedding.",
    description:
      "Meet Dubai's top wedding designers, planners, florists, couture houses, and entertainment partners in a curated showcase built for couples designing a truly premium celebration.",
    event_time: "6:00 PM",
    city: "Dubai",
    category: "Wedding",
    banner_url: gallery1,
  },
  "corporate-summit-dubai": {
    short_description: "A premium networking and keynote evening for C-level executives.",
    description:
      "A refined executive summit featuring keynote sessions, hosted conversations, premium networking moments, and hospitality tailored for senior leadership and invited business circles.",
    event_time: "6:30 PM",
    city: "Dubai",
    category: "Corporate",
    banner_url: gallery3,
  },
  "vogue-soiree-spring": {
    short_description: "An invitation-only fashion evening with Dubai's most discerning circle.",
    description:
      "Runway presentations, a champagne reception, editorial-grade styling, and an intimate afterparty shape this invitation-only fashion evening inspired by Dubai's couture scene.",
    event_time: "7:30 PM",
    city: "Dubai",
    category: "Fashion",
    banner_url: gallery5,
  },
  "ramadan-iftar-majlis": {
    short_description: "A serene majlis evening with traditional iftar, oud, and reflective company.",
    description:
      "Hosted in a refined Emirati-inspired setting, this majlis evening combines a traditional iftar spread, live oud and qanun, elegant desert hospitality, and a calm luxury atmosphere.",
    event_time: "6:15 PM",
    city: "Dubai",
    category: "Cultural",
    banner_url: gallery6,
  },
};

function normalizeBannerUrl(event: EventLike): string {
  const slug = event.slug ?? "";
  const mapped = slug ? FALLBACK_BY_SLUG[slug]?.banner_url : undefined;
  const bannerUrl = event.banner_url?.trim();

  if (!bannerUrl) {
    return mapped ?? gallery1;
  }

  if (bannerUrl in ASSET_BY_SOURCE) {
    return ASSET_BY_SOURCE[bannerUrl];
  }

  if (/^https?:\/\//i.test(bannerUrl) || bannerUrl.startsWith("data:")) {
    return bannerUrl;
  }

  return mapped ?? gallery1;
}

function buildDescription(event: EventLike, fallback?: Partial<EventLike>) {
  if (event.description?.trim()) return event.description.trim();
  if (fallback?.description?.trim()) return fallback.description.trim();
  if (event.short_description?.trim()) return event.short_description.trim();
  if (fallback?.short_description?.trim()) return fallback.short_description.trim();
  return "A signature Ceylon Kandy Events experience curated with premium production, hospitality, and unforgettable atmosphere.";
}

export function normalizeEvent<T extends EventLike>(event: T): T & {
  banner_url: string;
  short_description: string;
  description: string;
  currency: string;
  city: string;
  category: string;
  event_time: string;
} {
  const fallback = event.slug ? FALLBACK_BY_SLUG[event.slug] : undefined;

  return {
    ...event,
    banner_url: normalizeBannerUrl(event),
    short_description:
      event.short_description?.trim() ||
      fallback?.short_description ||
      "An elevated luxury event experience by Ceylon Kandy Events.",
    description: buildDescription(event, fallback),
    currency: event.currency || "AED",
    city: event.city || fallback?.city || "Dubai",
    category: event.category || fallback?.category || "Premium Event",
    event_time: event.event_time || fallback?.event_time || "To be announced",
  };
}

export function getFallbackEventImage(event: EventLike) {
  return normalizeBannerUrl(event);
}
