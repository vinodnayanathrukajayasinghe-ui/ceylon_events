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
        <p className="text-xs tracking-[0.4em] text-gold uppercase mb-4 font-medium">{eyebrow}</p>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory leading-[1.1]">
        {title}
      </h2>
      {align === "center" && (
        <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
      )}
      {subtitle && (
        <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
