import { motion } from "motion/react";
import { Card, GlowOrb, Particles, Reveal, Section, SectionHead } from "@/components/site/ui";

const stats = [
  { label: "LEVEL", value: "12" },
  { label: "STREAK", value: "18 DAYS" },
  { label: "BADGES", value: "24" },
  { label: "MISSIONS", value: "5" },
];

const features = [
  { title: "XP", body: "Earn experience from completed activities." },
  { title: "Levels", body: "Turn consistency into visible progression." },
  { title: "Streaks", body: "Build daily habits." },
  { title: "Badges", body: "Celebrate milestones." },
  { title: "Missions", body: "Complete focused daily challenges." },
  { title: "Rewards", body: "Use progression to unlock ecosystem rewards." },
];

export function Gamification() {
  return (
    <Section id="gamification" className="border-y border-border">
      <Particles count={16} />
      <GlowOrb className="left-[-6%] top-[20%] size-[24rem]" />
      <SectionHead
        eyebrow="Gamification"
        title={
          <>
            Turn Fitness Into <span className="text-gradient">Progress You Can See.</span>
          </>
        }
      />

      <Reveal>
        <div className="glass-strong mt-16 rounded-3xl p-7 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Experience</p>
              <p className="mt-2 font-display text-4xl font-extrabold md:text-5xl">
                XP <span className="text-gradient">7,450</span>
                <span className="text-muted-foreground"> / 10,000</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="eyebrow">{s.label}</p>
                  <p className="mt-1.5 font-display text-xl font-bold text-lavender">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 h-3 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundImage: "var(--gradient-violet)" }}
              initial={{ width: 0 }}
              whileInView={{ width: "74.5%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} index={i}>
            <Card className="h-full">
              <h3 className="font-display text-lg font-bold tracking-wide">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

const avatarStates = ["START", "CONSISTENT", "PROGRESSING", "ADVANCED"];

export function Avatar() {
  return (
    <Section id="avatar">
      <SectionHead
        eyebrow="Digital Avatar"
        title={
          <>
            Meet Your <span className="text-gradient">Digital Fitness Twin.</span>
          </>
        }
        subtitle="Visualize your fitness journey as your consistency and performance grow."
      />

      <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="glass-strong relative mx-auto grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-3xl">
            <Particles count={14} />
            <motion.svg
              viewBox="0 0 120 220"
              className="relative h-64"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <defs>
                <linearGradient id="avatarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--lavender)" />
                  <stop offset="100%" stopColor="var(--primary)" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="26" r="16" fill="url(#avatarGrad)" opacity="0.85" />
              <path
                d="M60 46 C40 50 34 72 36 98 L44 150 L52 210 L68 210 L76 150 L84 98 C86 72 80 50 60 46 Z"
                fill="url(#avatarGrad)"
                opacity="0.7"
              />
            </motion.svg>
            <p className="absolute bottom-6 font-display text-xs tracking-[0.22em] text-lavender">
              YOUR JOURNEY BECOMES VISIBLE
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4">
          {avatarStates.map((s, i) => (
            <Reveal key={s} index={i}>
              <div className="glass flex items-center gap-4 rounded-xl px-5 py-4">
                <span className="font-display text-sm text-lavender">0{i + 1}</span>
                <span className="font-display text-sm tracking-[0.16em]">{s}</span>
                <span className="ml-auto h-1 w-24 overflow-hidden rounded-full bg-secondary">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ backgroundImage: "var(--gradient-violet)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${25 * (i + 1)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.15 }}
                  />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

const wellness = ["Cycle-aware planning", "Wellness tracking", "Personalized fitness adjustments"];

export function Wellness() {
  return (
    <Section id="wellness" className="border-y border-border">
      <GlowOrb className="right-[-6%] bottom-0 size-[22rem]" />
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHead
          align="left"
          eyebrow="Women's Wellness"
          title={
            <>
              Fitness That Respects <span className="text-gradient">Different Wellness Needs.</span>
            </>
          }
          subtitle="FitFreak AI includes a dedicated Women's Wellness experience designed to support personalized fitness and wellness planning."
        />
        <div className="grid gap-4">
          {wellness.map((w, i) => (
            <Reveal key={w} index={i}>
              <Card glow>
                <p className="font-display text-base font-semibold">{w}</p>
              </Card>
            </Reveal>
          ))}
          <Reveal index={3}>
            <p className="text-xs text-muted-foreground">
              Sensitive Women&apos;s Wellness records are separated from general AI context. This
              experience supports wellness planning and does not provide medical advice.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
