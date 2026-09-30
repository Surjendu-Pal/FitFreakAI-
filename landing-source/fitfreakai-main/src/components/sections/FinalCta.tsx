import { CtaButton, GlowOrb, Particles, Reveal, Section } from "@/components/site/ui";

export function FinalCta() {
  return (
    <Section id="cta" className="border-t border-border">
      <div aria-hidden className="hero-aura absolute inset-0" />
      <div aria-hidden className="grid-floor absolute inset-0 opacity-60" />
      <Particles count={20} />
      <GlowOrb className="left-1/2 top-1/3 size-[34rem] -translate-x-1/2" />

      <Reveal className="relative mx-auto max-w-4xl text-center">
        <p className="eyebrow">Your Fitness. Your AI. Your Privacy.</p>
        <h2 className="mt-6 text-[clamp(2.2rem,5.6vw,4.25rem)] font-extrabold leading-[1.02]">
          The Future of Fitness
          <br />
          Should <span className="text-gradient glow-text">Adapt to You.</span>
        </h2>
        <p className="mt-6 font-display text-sm tracking-[0.28em] text-muted-foreground">
          TRAIN. ANALYZE. ADAPT. LEVEL UP.
        </p>
        <div className="mt-11 flex flex-wrap justify-center gap-4">
          <CtaButton href="#ecosystem">EXPLORE THE FITFREAK VISION</CtaButton>
          <CtaButton href="#architecture" variant="ghost">
            VIEW THE TECHNOLOGY
          </CtaButton>
        </div>
      </Reveal>
    </Section>
  );
}
