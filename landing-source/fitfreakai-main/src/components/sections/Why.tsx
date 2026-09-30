import { motion } from "motion/react";
import { Card, GlowOrb, Reveal, Section, SectionHead } from "@/components/site/ui";

const pillars = [
  {
    n: "01",
    title: "Adaptive AI",
    body: "Your plan can evolve with your goals, performance and progress instead of remaining a fixed routine.",
  },
  {
    n: "02",
    title: "AI Exercise Intelligence",
    body: "Camera-based exercise analysis can recognize movement, count repetitions and provide form feedback.",
  },
  {
    n: "03",
    title: "Privacy-First Camera AI",
    body: "Sensitive camera processing is designed around on-device analysis, minimizing the need to send raw footage to the backend.",
  },
  {
    n: "04",
    title: "Gamified Fitness",
    body: "XP, levels, streaks, badges, missions, challenges and rewards turn consistency into measurable progress.",
  },
  {
    n: "05",
    title: "One Fitness Ecosystem",
    body: "Workout, nutrition, recovery, coaching, progress, community and mentorship can exist within one ecosystem.",
  },
  {
    n: "06",
    title: "Human + AI",
    body: "AI provides scalable guidance while future mentorship features can connect users with real fitness professionals.",
  },
];

const inputs = ["GOAL", "PERFORMANCE", "WORKOUT", "PROGRESS", "WEIGHT", "FEEDBACK", "RECOVERY"];
const outputs = [
  "WORKOUT PLAN",
  "NUTRITION GUIDANCE",
  "RECOVERY GUIDANCE",
  "DAILY MISSIONS",
  "AI COACH",
  "PROGRESS INSIGHTS",
];

export function Why() {
  return (
    <Section id="features">
      <GlowOrb className="left-[-12%] bottom-0 size-[28rem]" />
      <SectionHead
        eyebrow="Why FitFreak AI"
        title={
          <>
            Why FitFreak AI Is <span className="text-gradient">Built Differently</span>
          </>
        }
      />
      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.n} index={i}>
            <Card glow className="h-full">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-sm font-bold text-lavender">{p.n}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function AiCore() {
  return (
    <Section id="ai" className="border-y border-border">
      <div aria-hidden className="hero-aura absolute inset-0 opacity-60" />
      <SectionHead
        eyebrow="AI Engine"
        title={
          <>
            The AI Doesn&apos;t Just Talk.
            <br />
            It <span className="text-gradient">Understands</span> Your Fitness Journey.
          </>
        }
        subtitle="FitFreak AI uses available fitness context to provide personalized guidance rather than treating every user the same."
      />

      <div className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_1.15fr_1fr]">
        <div className="grid gap-3">
          {inputs.map((t, i) => (
            <Reveal key={t} index={i}>
              <div className="glass flex items-center justify-between rounded-xl px-4 py-3 font-display text-xs tracking-[0.16em]">
                {t}
                <span className="text-lavender">→</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div aria-hidden className="pulse-glow absolute inset-6 rounded-full" style={{ background: "var(--gradient-violet)", opacity: 0.25, filter: "blur(30px)" }} />
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
              {Array.from({ length: 14 }).map((_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return (
                  <line
                    key={i}
                    x1={100}
                    y1={100}
                    x2={100 + Math.cos(a) * 88}
                    y2={100 + Math.sin(a) * 88}
                    stroke="var(--lavender)"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    className="flow-dash"
                  />
                );
              })}
              {Array.from({ length: 14 }).map((_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return (
                  <circle
                    key={`n${i}`}
                    cx={100 + Math.cos(a) * 88}
                    cy={100 + Math.sin(a) * 88}
                    r="3"
                    fill="var(--neon)"
                  />
                );
              })}
              <circle cx="100" cy="100" r="34" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
            </svg>
            <motion.div
              className="absolute inset-[34%] grid place-items-center rounded-full glass-strong text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <p className="font-display text-xs font-bold leading-tight">
                FITFREAK
                <br />
                <span className="text-lavender">AI ENGINE</span>
              </p>
            </motion.div>
          </div>
        </Reveal>

        <div className="grid gap-3">
          {outputs.map((t, i) => (
            <Reveal key={t} index={i}>
              <div className="glass-strong flex items-center gap-3 rounded-xl px-4 py-3 font-display text-xs tracking-[0.16em]">
                <span className="text-neon">→</span>
                {t}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal>
        <p className="mx-auto mt-14 max-w-2xl text-center text-xs text-muted-foreground">
          AI guidance is designed for general fitness and wellness support, not medical diagnosis.
        </p>
      </Reveal>
    </Section>
  );
}

const timeline = ["WEEK 01", "PERFORMANCE", "FEEDBACK", "WEEK 02", "ADAPTATION", "BETTER PLAN"];
const states = [
  { label: "BEGINNER", goal: "Build consistency" },
  { label: "INTERMEDIATE", goal: "Improve strength" },
  { label: "GOAL-DRIVEN", goal: "Optimize progression" },
];

export function AdaptivePlans() {
  return (
    <Section id="plans">
      <SectionHead
        eyebrow="Adaptive Plans"
        title={
          <>
            Your Plan <span className="text-gradient">Evolves</span> With You.
          </>
        }
        subtitle="Instead of treating every day as identical, FitFreak AI is designed around continuous feedback."
      />

      <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
        {timeline.map((t, i) => (
          <Reveal key={t} index={i}>
            <div className="flex items-center gap-3">
              <div className="glass rounded-full px-5 py-2.5 font-display text-xs tracking-[0.14em]">
                {t}
              </div>
              {i < timeline.length - 1 ? <span className="text-lavender">→</span> : null}
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {states.map((s, i) => (
          <Reveal key={s.label} index={i}>
            <Card className="h-full">
              <p className="eyebrow">{s.label}</p>
              <p className="mt-4 text-lg font-semibold">{s.goal}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="glass-strong mx-auto mt-12 flex max-w-2xl flex-col items-center gap-6 rounded-2xl p-8 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="eyebrow">Before</p>
            <p className="mt-2 font-display text-2xl font-bold text-muted-foreground line-through">
              3 × 10 Squats
            </p>
          </div>
          <motion.span
            className="font-display text-2xl text-lavender"
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            →
          </motion.span>
          <div className="text-center sm:text-right">
            <p className="eyebrow">After performance</p>
            <p className="mt-2 font-display text-2xl font-bold text-gradient">3 × 12 Squats</p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
