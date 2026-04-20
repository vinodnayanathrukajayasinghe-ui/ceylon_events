import { useEffect, useRef, useState } from "react";

interface Props {
  end: number;
  suffix?: string;
  duration?: number;
  label: string;
}

export function Counter({ end, suffix = "", duration = 1800, label }: Props) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const displayValue = val.toLocaleString("en-US");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const t0 = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - t0) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(end * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <div ref={ref} className="stat-panel text-center">
      <div className="stat-kicker">Legacy Metric</div>
      <div className="stat-number text-gradient-gold">
        <span>{displayValue}</span>
        {suffix ? <span className="stat-suffix">{suffix}</span> : null}
      </div>
      <div className="stat-divider mx-auto mt-5" />
      <div className="stat-label mt-4 text-ivory/62">{label}</div>
    </div>
  );
}
