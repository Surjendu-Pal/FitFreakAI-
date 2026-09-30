import { motion } from "motion/react";
import { Card, Chip, GlowOrb, Reveal, Section, SectionHead } from "@/components/site/ui";

const paths = [
  {
    title: "APPLICATION PATH",
    steps: ["USER", "REACT + VITE", "EXPRESS API", "CORE FITNESS SERVICES", "MONGODB"],
  },
  {
    title: "AI PATH",
    steps: [
      "USER FITNESS CONTEXT",
      "AI CONTEXT LAYER",
      "LOCAL OLLAMA",
      "QWEN MODEL",
      "FITFREAK AI RESPONSE",
    ],
  },
  {
    title: "CAMERA PATH",
    steps: ["CAMERA", "ON-DEVICE POSE MODEL", "POSE / REP / FORM DATA", "FITNESS SERVICES"],
  },
];

const chips = [
  "React 19",
  "Vite",
  "Express",
  "MongoDB",
  "Ollama",
  "Qwen",
  "MediaPipe",
  "MoveNet",
  "TensorFlow.js",
  "Blender",
];

export function Architecture() {
  return (
    <Section id="architecture">
      <GlowOrb className="left-[-10%] top-[8%] size-[26rem]" />
      <SectionHead
        eyebrow="System Architecture"
        title={
          <>
            Built Like a <span className="text-gradient">Real AI Product.</span>
          </>
        }
      />

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {paths.map((p, pi) => (
          <Reveal key={p.title} index={pi}>
            <div className="glass-strong h-full rounded-3xl p-7">
              <p className="font-display text-xs font-bold tracking-[0.22em] text-lavender">
                {p.title}
              </p>
              <div className="mt-7 grid gap-0">
                {p.steps.map((s, i) => (
                  <div key={s}>
                    <div className="glass rounded-xl px-4 py-3 font-display text-xs tracking-[0.12em]">
                      {s}
                    </div>
                    {i < p.steps.length - 1 ? (
                      <div className="relative mx-auto h-7 w-px bg-border">
                        <motion.span
                          className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-neon"
                          animate={{ top: ["0%", "100%"] }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            delay: (i + pi) * 0.25,
                            ease: "linear",
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

const nodes = [
  "AI COACH",
  "WORKOUT",
  "NUTRITION",
  "RECOVERY",
  "EXERCISE AI",
  "PROGRESS",
  "GAMIFICATION",
  "COMMUNITY",
  "WOMEN'S WELLNESS",
  "MENTORSHIP",
  "DIGITAL AVATAR",
];

export function Ecosystem() {
  return (
    <Section id="ecosystem" className="border-y border-border">
      <div aria-hidden className="grid-floor absolute inset-0 opacity-40" />
      <SectionHead
        eyebrow="The Ecosystem"
        title={
          <>
            More Than a <span className="text-gradient">Workout App.</span>
          </>
        }
        subtitle="One ecosystem for the complete fitness journey."
      />

      <Reveal>
        <div className="relative mx-auto mt-20 aspect-square w-full max-w-2xl">
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
            {nodes.map((_, i) => {
              const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1="200"
                  y1="200"
                  x2={200 + Math.cos(a) * 168}
                  y2={200 + Math.sin(a) * 168}
                  stroke="var(--lavender)"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                  className="flow-dash"
                />
              );
            })}
          </svg>

          {nodes.map((n, i) => {
            const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <motion.div
                key={n}
                className="glass absolute whitespace-nowrap rounded-full px-3 py-1.5 font-display text-[0.6rem] font-semibold tracking-[0.12em] md:text-[0.7rem]"
                style={{
                  left: `${50 + Math.cos(a) * 44}%`,
                  top: `${50 + Math.sin(a) * 44}%`,
                  transform: "translate(-50%, -50%)",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
              >
                {n}
              </motion.div>
            );
          })}

          <div className="glass-strong absolute inset-[33%] grid place-items-center rounded-full text-center">
            <p className="font-display text-sm font-extrabold leading-tight md:text-lg">
              FITFREAK
              <br />
              <span className="text-gradient">AI</span>
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

const journey = [
  "DISCOVER YOUR GOAL",
  "GET YOUR PLAN",
  "COMPLETE YOUR MISSION",
  "ANALYZE YOUR PERFORMANCE",
  "EARN XP",
  "TRACK YOUR PROGRESS",
  "ADAPT",
  "REPEAT",
];

export function Journey() {
  return (
    <Section id="journey">
      <SectionHead eyebrow="User Journey" title={<>How the Loop <span className="text-gradient">Works</span></>} />
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {journey.map((j, i) => (
          <Reveal key={j} index={i}>
            <Card className="h-full">
              <p className="font-display text-3xl font-extrabold text-primary/40">
                0{i + 1}
              </p>
              <p className="mt-3 font-display text-sm font-semibold tracking-[0.1em]">{j}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

const impact = [
  { title: "PERSONALIZATION", body: "Adaptive fitness guidance" },
  { title: "CONSISTENCY", body: "Gamification and streak mechanics" },
  { title: "PRIVACY", body: "On-device camera processing approach" },
  { title: "ACCESSIBILITY", body: "Smartphone-based fitness assistance" },
];

export function Impact() {
  return (
    <Section id="impact" className="border-y border-border">
      <SectionHead
        eyebrow="Impact"
        title={
          <>
            Designed Around <span className="text-gradient">Real Fitness Problems.</span>
          </>
        }
      />
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {impact.map((it, i) => (
          <Reveal key={it.title} index={i}>
            <Card glow className="h-full">
              <p className="font-display text-sm font-bold tracking-[0.18em] text-lavender">
                {it.title}
              </p>
              <p className="mt-4 text-base leading-relaxed">{it.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mx-auto mt-14 max-w-2xl text-center text-xl font-semibold md:text-2xl">
          Technology should make fitness more personal — not more complicated.
        </p>
      </Reveal>
    </Section>
  );
}

export function Safety() {
  return (
    <Section id="safety">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHead
          align="left"
          eyebrow="Responsible AI"
          title={
            <>
              AI With <span className="text-gradient">Responsible Boundaries.</span>
            </>
          }
          subtitle="FitFreak AI provides general fitness and wellness guidance. It is not a doctor, does not diagnose illness, prescribe medication or replace qualified medical care."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "No medical diagnosis",
            "No medication guidance",
            "Stop-and-seek-care prompts",
            "General wellness support only",
          ].map((s, i) => (
            <Reveal key={s} index={i}>
              <Card className="h-full">
                <span className="text-neon">✓</span>
                <p className="mt-3 text-sm">{s}</p>
              </Card>
            </Reveal>
          ))}
          <Reveal index={4}>
            <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">
              Warning symptoms such as chest pain or dizziness should trigger a stop-and-seek-care
              message rather than continued exercise.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
