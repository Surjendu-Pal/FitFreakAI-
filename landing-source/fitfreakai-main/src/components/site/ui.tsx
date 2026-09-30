import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative overflow-hidden px-5 py-24 md:px-10 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left"
      }
    >
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2 className="text-balance text-3xl font-bold leading-[1.1] md:text-5xl">{title}</h2>
      {subtitle ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">{subtitle}</p>
      ) : null}
    </Reveal>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-lavender">
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1.5 ${
        glow ? "glass-strong" : "glass"
      } hover:glow-ring ${className}`}
    >
      {children}
    </div>
  );
}

export function CtaButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-display text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "text-primary-foreground hover:scale-[1.03] hover:glow-ring"
      : "glass text-foreground hover:border-lavender/40 hover:text-lavender";
  return (
    <a
      href={href}
      className={`${base} ${styles}`}
      style={variant === "primary" ? { backgroundImage: "var(--gradient-violet)" } : undefined}
    >
      {children}
    </a>
  );
}

export function Particles({ count = 18 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="rise-particle absolute size-1 rounded-full bg-lavender/70"
          style={{
            left: `${(i * 97) % 100}%`,
            bottom: `${(i * 37) % 60}%`,
            animationDelay: `${(i % 9) * 0.8}s`,
            animationDuration: `${6 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}

export function GlowOrb({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pulse-glow pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: "var(--gradient-violet)", opacity: 0.22 }}
    />
  );
}
