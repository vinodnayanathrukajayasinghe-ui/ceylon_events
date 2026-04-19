import { useEffect, useState } from "react";
import logo from "@/assets/logo-ceylon-kandy.png";

/**
 * Premium first-load animation: gold particles ascending behind a fading logo.
 * Shows once per session.
 */
export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("cke-loaded")) {
      setHidden(true);
      return;
    }
    const t = setTimeout(() => {
      sessionStorage.setItem("cke-loaded", "1");
      setHidden(true);
    }, 1900);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-onyx"
      style={{ animation: "loader-fade-out 2.1s ease-in-out forwards" }}
      aria-hidden="true"
    >
      {/* Radial gold glow */}
      <div className="absolute inset-0 bg-radial-gold opacity-80" />

      {/* Sparks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 size-1 rounded-full bg-gradient-gold"
            style={{
              left: `${(i * 4.2 + Math.random() * 5) % 100}%`,
              animation: `spark ${1.4 + Math.random() * 1.2}s ease-out ${Math.random() * 1.5}s infinite`,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      {/* Logo with rotating gold ring */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full border border-gold-soft animate-spin-slow" />
          <div
            className="absolute inset-0 -m-10 rounded-full border-t border-gold animate-spin-slow"
            style={{ animationDuration: "8s", animationDirection: "reverse" }}
          />
          <img
            src={logo}
            alt="Ceylon Kandy Events"
            className="relative h-32 w-auto opacity-90 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
          />
        </div>
        <p className="font-display text-sm tracking-[0.4em] text-gold uppercase shimmer-gold">
          Crafting Luxury Moments
        </p>
      </div>
    </div>
  );
}
