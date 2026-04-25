/**
 * Ceylon Kandy Events - site-wide constants
 */
export const SITE = {
  name: "Ceylon Kandy Events",
  shortName: "Ceylon Kandy",
  tagline: "Dubai's Premier Luxury Event Experience",
  description:
    "Ceylon Kandy Events crafts unforgettable luxury events in Dubai - galas, weddings, brand launches, concerts, and VIP experiences. Premium event planning, ticketing, and production.",
  city: "Dubai, UAE",
  phone: "+971 50 407 3638",
  phoneRaw: "+971504073638",
  whatsapp: "971504073638",
  email: "info@ceylonkandyevents.com",
  founder: "Sameera Singhapali",
  url: "https://ceylonkandyevents.com",
  canonicalUrl: "https://ceylonkandyevents.com",
  ogImage: "/og-image.jpg",
  logoImage: "/brand-logo.png",
  iconImage: "/icon-512.png",
  favicon: "/favicon.png",
  social: {
    instagram: "#",
    facebook: "#",
    tiktok: "#",
    youtube: "#",
  },
};

export const whatsappLink = (
  msg = "Hello Ceylon Kandy Events, I'd like to inquire about your services.",
) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;

export const telLink = `tel:${SITE.phoneRaw}`;
