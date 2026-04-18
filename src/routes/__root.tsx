import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SiteLayout } from "@/components/SiteLayout";
import { AuthProvider } from "@/lib/auth";
import { SITE } from "@/lib/site";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <p className="text-xs tracking-[0.4em] text-gold uppercase">Error 404</p>
        <h1 className="mt-4 font-display text-7xl text-gradient-gold">Lost in the Lights</h1>
        <p className="mt-6 text-muted-foreground max-w-md mx-auto">
          The page you're looking for has moved or no longer exists.
        </p>
        <a href="/" className="mt-10 inline-block px-8 py-3 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs rounded-sm">
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
      { title: `${SITE.name} — ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { name: "theme-color", content: "#0a0908" },
      { property: "og:title", content: `${SITE.name} — ${SITE.tagline}` },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
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
    </AuthProvider>
  );
}
