import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo-ceylon-kandy.png";
import { SITE, telLink, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-gold-soft bg-onyx">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="container-luxe py-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-3 mb-5">
            <img src={logo} alt={SITE.name} className="h-14 w-auto" />
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Crafting Dubai's most exceptional luxury events. From private celebrations to international galas, we deliver moments worthy of memory.
          </p>
          <div className="flex gap-3 mt-6">
            {[
              { Icon: Instagram, href: SITE.social.instagram },
              { Icon: Facebook, href: SITE.social.facebook },
              { Icon: Youtube, href: SITE.social.youtube },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                aria-label="Social"
                className="size-10 grid place-items-center border border-gold-soft text-gold hover:bg-gold hover:text-primary-foreground transition-all rounded-sm"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gold mb-5">Explore</h4>
          <ul className="space-y-3 text-sm text-ivory/75">
            <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
            <li><Link to="/services" className="hover:text-gold transition-colors">Services</Link></li>
            <li><Link to="/events" className="hover:text-gold transition-colors">Events</Link></li>
            <li><Link to="/gallery" className="hover:text-gold transition-colors">Gallery</Link></li>
            <li><Link to="/founder" className="hover:text-gold transition-colors">Founder</Link></li>
            <li><Link to="/partners" className="hover:text-gold transition-colors">Partners</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gold mb-5">Engage</h4>
          <ul className="space-y-3 text-sm text-ivory/75">
            <li><Link to="/book" className="hover:text-gold transition-colors">Book an Event</Link></li>
            <li><Link to="/tickets" className="hover:text-gold transition-colors">Buy Tickets</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            <li><a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors">WhatsApp</a></li>
            <li><Link to="/login" className="hover:text-gold transition-colors">Customer Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gold mb-5">Contact</h4>
          <ul className="space-y-4 text-sm text-ivory/75">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 text-gold shrink-0" />
              <span>Dubai, United Arab Emirates</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 text-gold shrink-0" />
              <a href={telLink} className="hover:text-gold transition-colors">{SITE.phone}</a>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 text-gold shrink-0" />
              <a href={`mailto:${SITE.email}`} className="hover:text-gold transition-colors break-all">{SITE.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold-soft/40">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Ceylon Kandy Events. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="tracking-widest uppercase">Dubai · UAE</span>
            <Link to="/login" search={{ redirect: "/admin" } as never} className="hover:text-gold transition-colors uppercase tracking-widest">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
