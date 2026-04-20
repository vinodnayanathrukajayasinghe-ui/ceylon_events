import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Calendar, MapPin, Star } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { Counter } from "@/components/Counter";
import { SITE, whatsappLink } from "@/lib/site";
import heroImg from "@/assets/hero-band-stage-poster.jpg";
import heroVideo from "@/assets/hero-concert-stage.mp4";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import logoLeo from "@/assets/partner-leo.png";
import logoJunctions from "@/assets/partner-junctions-blast.png";
import logoAcademy from "@/assets/partner-ceylon-models-academy.png";
import logoMain from "@/assets/logo-ceylon-kandy.png";
import founderPortrait from "@/assets/sameera-portrait.png";
import serviceModeling from "@/assets/services/modeling-events-luxe.jpg";
import servicePrivate from "@/assets/services/private-parties-luxe.jpg";
import serviceLiveShows from "@/assets/services/live-shows-luxe.jpg";
import serviceHighVoltage from "@/assets/services/high-voltage-entertainment-luxe.jpg";
import serviceStageShows from "@/assets/services/stage-shows-luxe.jpg";
import serviceTicketed from "@/assets/services/ticketed-nights-luxe.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} | Luxury Events in Dubai` },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `${SITE.name} | Luxury Events in Dubai` },
      { property: "og:description", content: SITE.description },
    ],
  }),
  component: HomePage,
});

const SERVICES = [
  {
    title: "Modeling Events",
    desc: "Luxury fashion showcases with runway precision, cinematic spotlights, and elevated guest experience.",
    img: serviceModeling,
  },
  {
    title: "Private Parties",
    desc: "VIP nights layered with champagne service, tailored hosting, and a refined golden after-dark mood.",
    img: servicePrivate,
  },
  {
    title: "Live Shows",
    desc: "Concert-grade live performances executed with polished staging, crowd flow, and premium show calling.",
    img: serviceLiveShows,
  },
  {
    title: "High-Voltage Entertainment",
    desc: "DJ-led energy, intelligent lighting, and immersive sound design for nights that stay unforgettable.",
    img: serviceHighVoltage,
  },
  {
    title: "Stage Shows",
    desc: "Dramatic production concepts with theatrical lighting, choreography, and statement-making visual control.",
    img: serviceStageShows,
  },
  {
    title: "Ticketed Nights",
    desc: "Buzz-driven entry experiences with curated guest flow, exclusivity, and premium nightlife appeal.",
    img: serviceTicketed,
  },
];

const FEATURED = [
  {
    img: g1,
    title: "Royal Gala Night 2025",
    date: "Dec 20, 2025",
    venue: "Atlantis The Palm",
    price: "AED 850",
    slug: "royal-gala-night-2025",
  },
  {
    img: g2,
    title: "Desert Stars Concert",
    date: "Jan 18, 2026",
    venue: "Al Marmoom Desert",
    price: "AED 450",
    slug: "desert-stars-concert",
  },
  {
    img: g4,
    title: "New Year Rooftop 2026",
    date: "Dec 31, 2025",
    venue: "SLS Dubai",
    price: "Sold Out",
    slug: "new-year-rooftop-2026",
  },
];

function HomePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let mounted = true;
    const markReady = () => {
      if (mounted) setVideoReady(true);
    };

    const startPlayback = async () => {
      try {
        video.muted = true;
        video.defaultMuted = true;
        await video.play();
        markReady();
      } catch {
        // Keep the poster image visible when autoplay is blocked.
      }
    };

    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", markReady);
    void startPlayback();

    return () => {
      mounted = false;
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", markReady);
    };
  }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Luxury Dubai gala"
            className={`size-full object-cover scale-[1.02] transition-opacity duration-700 ${
              videoReady ? "opacity-18" : "opacity-100"
            }`}
          />
          <video
            ref={videoRef}
            className={`absolute inset-0 size-full object-cover object-[center_42%] scale-[1.16] transition-opacity duration-700 ${
              videoReady ? "opacity-[0.82]" : "opacity-0"
            }`}
            autoPlay
            muted
            defaultMuted
            loop
            playsInline
            preload="metadata"
            poster={heroImg}
            onLoadedData={() => setVideoReady(true)}
            disablePictureInPicture
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(5,6,20,0.84)_8%,rgba(15,17,58,0.46)_42%,rgba(10,7,28,0.84)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_34%,rgba(68,64,214,0.34),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(136,64,255,0.18),transparent_28%),radial-gradient(circle_at_70%_78%,rgba(24,78,193,0.22),transparent_30%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050816]/55 via-[#120d2d]/18 to-onyx/88" />
          <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#5b4bff]/18 to-transparent opacity-85" />
          <div className="absolute inset-y-0 right-0 w-[22%] bg-gradient-to-l from-[#050816] via-[#050816]/62 to-transparent opacity-92" />
          <div className="absolute bottom-0 right-0 h-[20%] w-[28%] bg-[radial-gradient(circle_at_100%_100%,rgba(5,8,22,0.96),rgba(5,8,22,0.72)_36%,transparent_76%)]" />
        </div>

        <div className="container-luxe relative z-10 py-20">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-xs tracking-[0.5em] text-gold uppercase mb-6">
              Dubai - United Arab Emirates
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-ivory">
              Bringing The <span className="text-gradient-gold italic">Energy</span>
              <br />
              People Keep <span className="text-gradient-gold italic">Talking About</span>
            </h1>
            <p className="section-copy mt-8 max-w-xl text-lg text-ivory/75">
              Bringing the energy and excitement that keeps people talking. Stunning modeling
              events, sensational live shows, and high-voltage entertainment designed for premium
              crowds and unforgettable nights.
            </p>
            <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-full border border-gold/25 bg-onyx/45 px-5 py-2.5 backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_14px_rgba(212,175,55,0.8)] animate-pulse-gold" />
              <span className="text-[11px] uppercase tracking-[0.32em] text-ivory/75">
                Exclusive Live Stage Setup
              </span>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/book"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:shadow-gold-lg transition-all"
              >
                Book an Event{" "}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/tickets"
                className="inline-flex items-center gap-3 px-8 py-4 border border-gold text-gold uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:bg-gold hover:text-primary-foreground transition-all"
              >
                Buy Tickets
              </Link>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 text-ivory/80 uppercase tracking-[0.2em] text-xs hover:text-gold transition-all"
              >
                WhatsApp Inquiry
              </a>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-[7%] top-1/2 z-10 hidden xl:block -translate-y-1/2">
          <div className="w-72 border border-gold/20 bg-onyx/35 p-6 backdrop-blur-xl shadow-gold">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Signature Scenes</p>
            <div className="mt-5 space-y-4">
              {[
                "Exclusive band and stage productions",
                "Private showcases with premium lighting design",
                "Concert-style setups for luxury audiences",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.7)]" />
                  <p className="text-sm leading-relaxed text-ivory/76">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-gold animate-fade-in">
          <span className="text-[10px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="h-12 w-px bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* COUNTERS */}
      <section className="py-24 bg-charcoal/40 border-y border-gold-soft">
        <div className="container-luxe grid grid-cols-2 md:grid-cols-4 gap-12">
          <Counter end={12} suffix="+" label="Years of Excellence" />
          <Counter end={480} suffix="+" label="Events Crafted" />
          <Counter end={15000} suffix="+" label="Happy Guests" />
          <Counter end={50} suffix="+" label="Premium Partners" />
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-32">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Upcoming"
            title="Featured Events"
            subtitle="High-energy nights, fashion-forward moments, and premium experiences built to keep people talking."
          />
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {FEATURED.map((e) => (
              <a
                href={`/events/${e.slug}`}
                key={e.slug}
                className="group relative overflow-hidden rounded-sm border border-gold-soft bg-charcoal hover:border-gold transition-all duration-500"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={e.img}
                    alt={e.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-2 flex items-center gap-2">
                    <Calendar size={12} />
                    {e.date}
                  </p>
                  <h3 className="font-display text-2xl text-ivory mb-2">{e.title}</h3>
                  <div className="flex items-center justify-between text-sm text-ivory/70">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {e.venue}
                    </span>
                    <span className="text-gold font-medium">{e.price}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/events"
              className="inline-flex items-center gap-3 text-gold uppercase tracking-[0.3em] text-xs hover:gap-5 transition-all"
            >
              View All Events <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-32 bg-charcoal/30 border-y border-gold-soft">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="What We Do"
            title="Premium Services"
            subtitle="Six signature service pillars shaped with cinematic production, nightlife polish, and black-gold brand discipline."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <article
                key={s.title}
                className="service-panel group rounded-[1.5rem] border border-gold-soft shadow-gold transition-all duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-gold-lg"
              >
                <div className="service-panel__media">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="service-panel__image"
                  />
                </div>
                <div className="service-panel__body">
                  <Sparkles
                    size={18}
                    className="mb-5 text-gold transition-transform duration-500 group-hover:scale-125"
                  />
                  <h3 className="font-display text-[1.9rem] leading-[0.98] text-ivory transition-colors duration-500 group-hover:text-gold">
                    {s.title}
                  </h3>
                  <p className="section-copy mt-4 text-sm text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/services"
              className="inline-flex items-center gap-3 text-gold uppercase tracking-[0.3em] text-xs hover:gap-5 transition-all"
            >
              Explore All Services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="py-32">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Moments"
            title="The Gallery"
            subtitle="Glimpses into the worlds we create."
          />
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-3">
            {[g1, g2, g3, g4, g5, g6].map((src, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-sm ${i % 5 === 0 ? "row-span-2" : ""}`}
              >
                <img
                  src={src}
                  alt="Event"
                  loading="lazy"
                  className="size-full object-cover aspect-square transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-3 text-gold uppercase tracking-[0.3em] text-xs hover:gap-5 transition-all"
            >
              View Full Gallery <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 bg-charcoal/30 border-y border-gold-soft">
        <div className="container-luxe">
          <SectionHeading eyebrow="Voices" title="What Clients Say" />
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Khalid Al Mansoori",
                role: "Private Client",
                quote:
                  "Ceylon Kandy delivered an evening that exceeded every expectation. Pure elegance from arrival to farewell.",
              },
              {
                name: "Layla Hassan",
                role: "Brand Director",
                quote:
                  "Our brand launch felt like a Met Gala. The team's eye for detail is unmatched in Dubai.",
              },
              {
                name: "Sanjay Mehra",
                role: "CEO, Mehra Group",
                quote:
                  "Year after year, our gala under their direction is the highlight of our calendar. Truly first-class.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-8 border border-gold-soft bg-onyx/60 backdrop-blur-sm hover:border-gold hover:-translate-y-1 transition-all duration-500"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" className="text-gold" />
                  ))}
                </div>
                <p className="font-display text-lg text-ivory leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="mt-6 pt-6 border-t border-gold-soft">
                  <p className="text-gold text-sm tracking-wide">{t.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER HIGHLIGHT */}
      <section className="py-32">
        <div className="container-luxe grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] max-w-md mx-auto w-full">
            <div className="absolute inset-0 -m-3 border border-gold opacity-60" />
            <div className="relative size-full overflow-hidden">
              <img
                src={founderPortrait}
                alt="Sameera Sinhapali, Founder of Ceylon Kandy Events"
                className="size-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.4em] text-gold uppercase mb-4">The Founder</p>
            <h2 className="font-display text-5xl md:text-6xl text-ivory leading-tight">
              Sameera <span className="text-gradient-gold italic">Sinhapali</span>
            </h2>
            <div className="mt-6 h-px w-24 bg-gradient-to-r from-gold to-transparent" />
            <p className="mt-8 text-lg text-ivory/80 leading-relaxed">
              A visionary at the heart of Dubai's luxury events scene, Sameera built Ceylon Kandy
              Events on a singular belief: that every celebration deserves to be unforgettable.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              From intimate private gatherings to internationally-attended galas, his leadership has
              defined a new standard of premium event craft in the UAE.
            </p>
            <Link
              to="/founder"
              className="mt-10 inline-flex items-center gap-3 text-gold uppercase tracking-[0.3em] text-xs hover:gap-5 transition-all"
            >
              Read His Journey <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-24 bg-charcoal/40 border-y border-gold-soft">
        <div className="container-luxe">
          <SectionHeading eyebrow="Ecosystem" title="Our Valuable Partners" />
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { src: logoMain, name: "Ceylon Models" },
              { src: logoLeo, name: "Leo Consultancy" },
              { src: logoJunctions, name: "Junctions Blast" },
              { src: logoAcademy, name: "Ceylon Models Academy" },
            ].map((p) => (
              <div
                key={p.name}
                className="partner-card-luxe aspect-square grid place-items-center p-8 border border-gold-soft bg-onyx hover:border-gold hover:bg-charcoal hover:shadow-gold transition-all duration-500 group"
              >
                <img
                  src={p.src}
                  alt={p.name}
                  className="partner-logo-luxe max-h-24 w-auto opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/partners"
              className="inline-flex items-center gap-3 text-gold uppercase tracking-[0.3em] text-xs hover:gap-5 transition-all"
            >
              Explore the Group <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="container-luxe">
          <div className="relative overflow-hidden rounded-sm border border-gold p-12 md:p-20 text-center bg-gradient-to-br from-charcoal to-onyx">
            <div className="absolute inset-0 bg-radial-gold opacity-40" />
            <div className="relative">
              <p className="text-xs tracking-[0.4em] text-gold uppercase mb-5">Begin Your Story</p>
              <h2 className="font-display text-4xl md:text-6xl text-ivory leading-tight max-w-3xl mx-auto">
                Let us craft your <span className="text-gradient-gold italic">next moment</span>.
              </h2>
              <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
                Speak with our event concierge. Available across Dubai and the wider UAE.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Link
                  to="/book"
                  className="px-8 py-4 bg-gradient-gold text-primary-foreground uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:shadow-gold-lg transition-all"
                >
                  Book an Event
                </Link>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 border border-gold text-gold uppercase tracking-[0.2em] text-xs font-medium rounded-sm hover:bg-gold hover:text-primary-foreground transition-all"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
