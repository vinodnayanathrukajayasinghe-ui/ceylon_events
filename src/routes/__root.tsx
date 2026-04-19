import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SiteLayout } from "@/components/SiteLayout";
import { AuthProvider } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { Toaster } from "@/components/ui/sonner";

const absoluteUrl = (path: string) => new URL(path, SITE.url).toString();

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.canonicalUrl,
  logo: absoluteUrl(SITE.logoImage),
  image: absoluteUrl(SITE.ogImage),
  telephone: SITE.phone,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.canonicalUrl,
  image: absoluteUrl(SITE.ogImage),
};

const schemaJson = JSON.stringify([organizationSchema, websiteSchema]);

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <p className="text-xs tracking-[0.4em] text-gold uppercase">Error 404</p>
        <h1 className="mt-4 font-display text-7xl text-gradient-gold">Lost in the Lights</h1>
        <p className="mt-6 text-muted-foreground max-w-md mx-auto">
          The page you're looking for has moved or no longer exists.
        </p>
        <a
          href="/"
          className="mt-10 inline-block px-8 py-3 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs rounded-sm"
        >
          Return Home
        </a>
      </div>
    </SiteLayout>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE.name} | ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { name: "theme-color", content: "#0a0908" },
      { name: "application-name", content: SITE.name },
      { name: "apple-mobile-web-app-title", content: SITE.shortName },
      { property: "og:title", content: `${SITE.name} | ${SITE.tagline}` },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:url", content: SITE.canonicalUrl },
      { property: "og:image", content: absoluteUrl(SITE.ogImage) },
      { property: "og:image:secure_url", content: absoluteUrl(SITE.ogImage) },
      {
        property: "og:image:alt",
        content: `${SITE.name} gold elephant logo on a black background`,
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${SITE.name} | ${SITE.tagline}` },
      { name: "twitter:description", content: SITE.description },
      { name: "twitter:image", content: absoluteUrl(SITE.ogImage) },
      {
        name: "twitter:image:alt",
        content: `${SITE.name} gold elephant logo on a black background`,
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE.canonicalUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", href: SITE.favicon },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <LoadingScreen />
      <Outlet />
      <Toaster theme="dark" position="top-center" />
    </AuthProvider>
  );
}
