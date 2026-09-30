import { motion } from "motion/react";
import { CtaButton, GlowOrb, Particles } from "@/components/site/ui";
import { useAuth } from "@/context/useAuth";

const floatingCards = [
  { label: "FORM SCORE", value: "94%", pos: "-left-4 md:-left-8 top-[24%]", delay: 0 },
  { label: "REP COUNT", value: "12", pos: "-right-3 md:-right-6 top-[42%]", delay: 0.8 },
  { label: "XP EARNED", value: "+50", pos: "-left-2 md:-left-6 bottom-[16%]", delay: 1.6 },
  { label: "POSTURE", value: "GOOD", pos: "-right-2 md:-right-4 bottom-[8%]", delay: 2.4 },
];


export function Hero() {
  const { user } = useAuth();

  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden px-5 pt-28 pb-16 md:px-10">
      <div aria-hidden className="hero-aura absolute inset-0" />
      <div aria-hidden className="grid-floor absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="beam-sweep absolute -top-1/3 left-0 h-[180%] w-40 bg-lavender/10 blur-3xl"
      />
      <Particles count={22} />
      <GlowOrb className="left-[-10%] top-[10%] size-[32rem]" />
      <GlowOrb className="right-[-12%] top-[25%] size-[38rem] opacity-60" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.65rem] font-semibold tracking-[0.24em] text-lavender"
          >
            <span className="size-1.5 rounded-full bg-neon" />
            AI-POWERED FITNESS ECOSYSTEM
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-7 text-[clamp(2.4rem,6.4vw,4.75rem)] font-extrabold leading-[0.98]"
          >
            TRAIN <span className="text-gradient glow-text">SMARTER.</span>
            <br />
            MOVE BETTER.
            <br />
            BECOME YOUR BEST.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            FitFreak AI combines adaptive fitness planning, AI coaching, real-time exercise analysis,
            gamification and privacy-first technology into one intelligent fitness ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <CtaButton href={user ? "/dashboard" : "/signup"}>Get Started</CtaButton>
            <CtaButton href="#ecosystem">Explore FitFreak AI</CtaButton>
            <CtaButton href="#ai" variant="ghost">
              See How Our AI Works
            </CtaButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 font-display text-xs tracking-[0.2em] text-muted-foreground"
          >
            YOUR FITNESS. YOUR AI. YOUR PRIVACY.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative mx-auto w-full max-w-xl lg:max-w-2xl"
        >
          {/* Ambient Glow behind visual */}
          <div
            aria-hidden
            className="pulse-glow pointer-events-none absolute -inset-8 rounded-full bg-primary/25 blur-3xl -z-10"
          />

          {/* AI Circular Analysis Rings */}
          <div
            aria-hidden
            className="spin-slow pointer-events-none absolute -inset-4 md:-inset-8 rounded-full border border-lavender/20"
          />
          <div
            aria-hidden
            className="spin-slow pointer-events-none absolute -inset-10 md:-inset-16 rounded-full border border-dashed border-primary/35"
            style={{ animationDirection: "reverse" }}
          />

          {/* Enlarged Central Rounded Frame */}
          <div className="glass-strong relative aspect-[1.2/1] w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-lavender/30 ring-1 ring-primary/40 shadow-[0_0_60px_-15px_rgba(168,85,247,0.45)]">
            <img
              src="/hero-fitness.jpg"
              alt="Two athletes exercising with real-time AI pose tracking"
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith(".png")) {
                  target.src = "/hero-fitness.jpg.png";
                }
              }}
            />

            {/* Integrated Equalizer at bottom */}
            <div className="absolute inset-x-8 md:inset-x-12 bottom-5 z-10 flex items-end justify-center gap-1.5">
              {[6, 14, 9, 22, 12, 28, 16, 34, 20, 26, 11, 18].map((h, i) => (
                <motion.span
                  key={i}
                  className="flex-1 max-w-[28px] rounded-t bg-neon/80"
                  animate={{ height: [h, h * 2.1, h] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
                  style={{ height: h }}
                />
              ))}
            </div>
          </div>

          {/* 4 Floating Metric Cards */}
          {floatingCards.map((c) => (
            <motion.div
              key={c.label}
              className={`glass-strong absolute ${c.pos} z-20 rounded-xl px-4 py-3 shadow-lg`}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
            >
              <p className="text-[0.6rem] tracking-[0.18em] text-muted-foreground">{c.label}</p>
              <p className="font-display text-lg font-bold text-lavender">{c.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
