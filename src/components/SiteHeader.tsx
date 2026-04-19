import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Shield } from "lucide-react";
import logo from "@/assets/logo-header.png";
import { SITE } from "@/lib/site";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/founder", label: "Founder" },
  { to: "/partners", label: "Partners" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();
  const { isAdmin } = useAuth();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-onyx/85 backdrop-blur-xl border-b border-gold-soft" : "bg-transparent"
      }`}
    >
      <div className="container-luxe flex items-center justify-between h-[5.8rem] md:h-[6.3rem] lg:h-[6.7rem]">
        <Link
          to="/"
          className="relative flex items-center gap-3 group shrink-0"
          aria-label={SITE.name}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-7 rounded-full bg-[radial-gradient(circle,rgba(244,202,89,0.32),transparent_62%)] blur-3xl opacity-72 animate-logo-glow"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-11 right-0 top-1/2 h-14 -translate-y-1/2 bg-gradient-to-r from-transparent via-gold-bright/76 to-transparent blur-xl opacity-78 animate-logo-sheen"
          />
          <img
            src={logo}
            alt={SITE.name}
            className="relative h-[3.8rem] md:h-[4.8rem] lg:h-[5.8rem] w-auto max-w-[11rem] md:max-w-[14rem] lg:max-w-[16.5rem] drop-shadow-[0_0_22px_rgba(212,175,55,0.32)] transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative text-[13px] uppercase tracking-[0.16em] text-ivory/80 hover:text-gold transition-colors py-2"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] text-gold/80 hover:text-gold inline-flex items-center gap-1.5"
              title="Admin"
            >
              <Shield size={14} /> Admin
            </Link>
          )}
          <Link
            to="/book"
            className="px-3.5 xl:px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] border border-gold text-gold hover:bg-gold hover:text-primary-foreground transition-all duration-300 rounded-sm"
          >
            Book Event
          </Link>
          <Link
            to="/tickets"
            className="px-3.5 xl:px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] bg-gradient-gold text-primary-foreground hover:shadow-gold transition-all duration-300 rounded-sm font-medium"
          >
            Buy Tickets
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-gold"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-onyx/95 backdrop-blur-xl border-t border-gold-soft animate-fade-in">
          <nav className="container-luxe py-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="py-3 text-sm uppercase tracking-[0.2em] text-ivory/80 border-b border-gold-soft/30"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-5">
              <Link
                to="/book"
                className="py-3 text-center text-xs uppercase tracking-[0.2em] border border-gold text-gold rounded-sm"
              >
                Book Event
              </Link>
              <Link
                to="/tickets"
                className="py-3 text-center text-xs uppercase tracking-[0.2em] bg-gradient-gold text-primary-foreground rounded-sm font-medium"
              >
                Buy Tickets
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
