import { motion } from "motion/react";
import { Card, Reveal, Section, SectionHead } from "@/components/site/ui";

const pillars = ["Challenges", "Leaderboards", "Achievements", "Community"];

export function Community() {
  return (
    <Section id="community">
      <SectionHead
        eyebrow="Community"
        title={
          <>
            Fitness Is <span className="text-gradient">Better Together.</span>
          </>
        }
        subtitle="Users can celebrate achievements, participate in challenges and build motivation through community interaction."
      />

      <div className="mt-16 grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="glass-strong flex items-center gap-4 rounded-2xl p-5"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <span
                className="grid size-11 place-items-center rounded-xl font-display text-sm font-bold text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-violet)" }}
              >
                {["A", "R", "K"][i]}
              </span>
              <div>
                <p className="eyebrow">Achievement Shared</p>
                <p className="mt-1 text-sm font-semibold">Completed 30-Day Challenge</p>
              </div>
              <span className="ml-auto font-display text-sm font-bold text-neon">+120 XP</span>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p} index={i}>
              <Card className="h-full">
                <p className="font-display text-lg font-bold">{p}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

const ai = ["24/7 guidance", "Workout insights", "Fitness questions", "Adaptive recommendations"];
const human = ["Expert guidance", "Personal sessions", "Human feedback", "Mentorship"];

export function Mentorship() {
  return (
    <Section id="mentorship" className="border-y border-border">
      <SectionHead
        eyebrow="AI + Human"
        title={
          <>
            AI When You Need It.
            <br />
            <span className="text-gradient">Human Expertise</span> When You Want It.
          </>
        }
        subtitle="Mentorship is part of the broader FitFreak AI ecosystem vision."
      />

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {[
          { title: "AI COACH", items: ai },
          { title: "FITNESS MENTOR", items: human },
        ].map((col, ci) => (
          <motion.div
            key={col.title}
            className="glass-strong rounded-3xl p-8"
            initial={{ opacity: 0, x: ci === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-display text-sm font-bold tracking-[0.22em] text-lavender">
              {col.title}
            </p>
            <div className="divider-line my-6" />
            <ul className="grid gap-3">
              {col.items.map((it) => (
                <li key={it} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-neon" />
                  {it}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
