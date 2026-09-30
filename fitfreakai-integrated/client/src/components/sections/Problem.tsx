import { motion } from "motion/react";
import { Card, GlowOrb, Reveal, Section, SectionHead } from "@/components/site/ui";

const problems = [
  {
    n: "01",
    title: "Static Plans",
    body: "Predefined routines don't always adapt to changing performance, goals or daily condition.",
  },
  {
    n: "02",
    title: "No Real-Time Form Feedback",
    body: "Users can repeat incorrect movements without knowing what needs improvement.",
  },
  {
    n: "03",
    title: "Limited Personalization",
    body: "Different bodies, goals and performance levels need different guidance.",
  },
  {
    n: "04",
    title: "Camera Privacy Concerns",
    body: "Sensitive body images and workout videos can create privacy concerns when processing happens in the cloud.",
  },
  {
    n: "05",
    title: "Motivation Drops",
    body: "Repeating the same routine without meaningful feedback can make consistency difficult.",
  },
];

const stages = [
  { key: "PLAN",    icon: "📅", desc: "Personalized workouts, nutrition & recovery plans.",       angle: -90       },
  { key: "PERFORM", icon: "🏋️", desc: "Do your workouts with real-time AI guidance.",             angle: -90 + 72  },
  { key: "ANALYZE", icon: "📊", desc: "Form detection, rep counting & performance tracking.",      angle: -90 + 144 },
  { key: "ADAPT",   icon: "🔄", desc: "AI adjusts your plan based on your progress and recovery.", angle: -90 + 216 },
  { key: "REWARD",  icon: "🏆", desc: "Earn XP, badges, levels & unlock new challenges.",          angle: -90 + 288 },
];

function toXY(angleDeg: number, r: number, cx = 50, cy = 50) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function Problem() {
  return (
    <Section id="problem">
      <GlowOrb className="right-[-10%] top-0 size-[26rem]" />
      <SectionHead
        eyebrow="The Problem"
        title={
          <>
            Fitness Has Changed.
            <br />
            But Most Fitness Apps <span className="text-gradient">Haven&apos;t.</span>
          </>
        }
      />

      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((p, i) => (
          <Reveal key={p.n} index={i}>
            <Card className="h-full">
              <p className="font-display text-4xl font-extrabold text-primary/40">{p.n}</p>
              <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Solution() {
  return (
    <Section id="solution" className="border-y border-border">
      <div aria-hidden className="grid-floor absolute inset-0 opacity-40" />
      <SectionHead
        eyebrow="The Solution"
        title={
          <>
            Meet <span className="text-gradient">FitFreak AI</span>
          </>
        }
        subtitle="From static routines to an adaptive fitness ecosystem."
      />

      <div className="relative mt-16">
        {/* Full-width feedback loop diagram */}
        <div className="relative mx-auto w-full max-w-4xl">

          {/* SVG: circular arrow path connecting the five stages */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible" }}
            aria-hidden
          >
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="var(--primary)" opacity="0.85" />
              </marker>
              <filter id="glowLine">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {stages.map((s, i) => {
              const next = stages[(i + 1) % stages.length];
              const a1 = s.angle + 14;
              const a2 = next.angle - 14;
              const r = 38;
              const p1 = toXY(a1, r);
              const p2 = toXY(a2, r);
              const mid = toXY((a1 + a2) / 2, r + 3);
              return (
                <path
                  key={s.key}
                  d={`M ${p1.x} ${p1.y} Q ${mid.x} ${mid.y} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="0.7"
                  strokeOpacity="0.75"
                  markerEnd="url(#arrowhead)"
                  filter="url(#glowLine)"
                />
              );
            })}
          </svg>

          {/* Centre glowing orb */}
          <div className="relative mx-auto flex aspect-square w-[54%] max-w-[340px] items-center justify-center">
            {/* outer pulse ring */}
            <div
              aria-hidden
              className="pulse-glow absolute inset-[-14%] rounded-full"
              style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)" }}
            />
            {/* main circle */}
            <div
              className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full text-center"
              style={{
                background: "radial-gradient(circle at 50% 35%, color-mix(in oklab, var(--primary) 22%, oklch(0.11 0.028 300)), oklch(0.11 0.028 300) 72%)",
                border: "1px solid color-mix(in oklab, var(--lavender) 35%, transparent)",
                boxShadow: "0 0 48px -8px color-mix(in oklab, var(--primary) 55%, transparent), inset 0 0 32px -12px color-mix(in oklab, var(--primary) 20%, transparent)",
              }}
            >
              <span className="mb-1 text-2xl select-none">✦</span>
              <p className="font-display text-base font-extrabold leading-tight tracking-wide">CONTINUOUS</p>
              <p className="font-display text-base font-extrabold leading-tight tracking-wide text-lavender">FEEDBACK LOOP</p>
            </div>
          </div>

          {/* Five stage cards positioned around the circle */}
          {stages.map((s, i) => {
            const pos = toXY(s.angle, 38);
            return (
              <motion.div
                key={s.key}
                className="glass-strong absolute z-20 w-36 rounded-2xl px-3 py-3 text-center shadow-lg"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  border: "1px solid color-mix(in oklab, var(--lavender) 28%, transparent)",
                  boxShadow: "0 4px 24px -8px color-mix(in oklab, var(--primary) 40%, transparent)",
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              >
                <span className="text-xl">{s.icon}</span>
                <p className="mt-1 font-display text-[0.7rem] font-extrabold tracking-[0.16em]">{s.key}</p>
                <p className="mt-1 text-[0.6rem] leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
