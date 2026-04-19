interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", className = "" }: Props) {
  return (
    <div className={`${align === "center" ? "text-center mx-auto max-w-3xl" : ""} ${className}`}>
      {eyebrow && (
        <p className="eyebrow-luxe mb-4 text-gold">{eyebrow}</p>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory leading-[0.98]">
        {title}
      </h2>
      {align === "center" && (
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
      )}
      {subtitle && (
        <p className="section-copy mt-6 text-base md:text-lg text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
