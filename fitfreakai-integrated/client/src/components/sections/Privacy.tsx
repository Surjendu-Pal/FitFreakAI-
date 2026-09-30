import { motion } from "motion/react";
import { Card, GlowOrb, Reveal, Section, SectionHead } from "@/components/site/ui";

const pipeline = [
  "Pose Detection",
  "Exercise Recognition",
  "Rep Counting",
  "Form Analysis",
  "Fitness Metrics",
];

const layers = [
  "ON-DEVICE AI",
  "SECURE LOCAL STORAGE",
  "HARDWARE-BACKED KEY PROTECTION",
  "OPTIONAL CLOUD SYNC",
];

export function Privacy() {
  return (
    <Section id="privacy" className="border-y border-border">
      <GlowOrb className="right-[-8%] top-[10%] size-[30rem]" />
      <SectionHead
        eyebrow="Privacy by Design"
        title={
          <>
            Your Camera.
            <br />
            Your Device. <span className="text-gradient">Your Control.</span>
          </>
        }
        subtitle="Privacy should be part of the architecture — not an afterthought."
      />

      <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="glass-strong relative mx-auto w-full max-w-xs rounded-[2.2rem] p-3">
            <div className="relative overflow-hidden rounded-[1.8rem] border border-border p-4">
              <div aria-hidden className="grid-floor absolute inset-0 opacity-60" />
              <p className="eyebrow relative">Camera Frame</p>
              <div className="relative mt-4 grid h-44 place-items-center rounded-xl border border-dashed border-lavender/30">
                <motion.div
                  className="font-display text-xs tracking-[0.2em] text-lavender"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  SQUAT DETECTED
                </motion.div>
                <motion.div
                  aria-hidden
                  className="absolute inset-x-2 h-px bg-neon/80"
                  animate={{ top: ["8%", "88%", "8%"] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="relative mt-4 grid gap-2">
                {pipeline.map((p, i) => (
                  <motion.div
                    key={p}
                    className="glass rounded-lg px-3 py-2 text-xs"
                    animate={{ opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  >
                    {p}
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center font-display text-[0.65rem] tracking-[0.2em] text-lavender">
              ON-DEVICE AI
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5">
          <Reveal>
            <Card className="border-destructive/30">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Raw Video</p>
                  <p className="mt-2 font-display text-xl font-bold">Stays on device</p>
                </div>
                <span className="font-display text-sm text-destructive">✕ NOT UPLOADED</span>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>DEVICE</span>
                <span className="flex-1 border-t border-dashed border-destructive/50" />
                <span>CLOUD</span>
              </div>
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card glow>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Derived Fitness Data</p>
                  <p className="mt-2 font-display text-xl font-bold text-gradient">
                    Pose · Reps · Form
                  </p>
                </div>
                <span className="font-display text-sm text-neon">→ SYNCED</span>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>DEVICE</span>
                <svg viewBox="0 0 100 4" className="h-1 flex-1">
                  <line x1="0" y1="2" x2="100" y2="2" stroke="var(--neon)" strokeWidth="2" className="flow-dash" />
                </svg>
                <span>CLOUD</span>
              </div>
            </Card>
          </Reveal>

          <Reveal index={2}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Raw workout footage is designed to be processed locally for camera-based exercise
              analysis. The system can extract useful information such as pose landmarks, repetition
              counts and form metrics without requiring raw video to be uploaded to the backend by
              default. Cloud synchronization stays optional and controlled.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-4">
        {layers.map((l, i) => (
          <Reveal key={l} index={i}>
            <div className="glass h-full rounded-xl p-5 font-display text-xs leading-relaxed tracking-[0.12em]">
              <span className="text-lavender">0{i + 1}</span>
              <p className="mt-3">{l}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          Hardware-backed security such as Android Keystore can provide an additional protection
          layer for locally stored sensitive data. On-device camera AI is separate from the local
          server AI that powers the application backend.
        </p>
      </Reveal>
    </Section>
  );
}

const checks = ["KNEE ALIGNMENT", "BACK POSITION", "DEPTH"];

export function ExerciseCoach() {
  return (
    <Section id="coach">
      <SectionHead
        eyebrow="AI Exercise Coach"
        title={
          <>
            Your Camera Becomes Your <span className="text-gradient">Training Assistant.</span>
          </>
        }
      />

      <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div className="glass-strong relative overflow-hidden rounded-3xl p-6">
            <div aria-hidden className="grid-floor absolute inset-0 opacity-50" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Live Session</p>
                <p className="mt-2 font-display text-3xl font-extrabold">
                  REP <span className="text-gradient">08</span>
                </p>
              </div>
              <div className="text-right">
                <p className="eyebrow">Form</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-neon">92%</p>
              </div>
            </div>

            <div className="relative mt-8 grid h-56 place-items-center rounded-2xl border border-dashed border-lavender/25">
              <svg viewBox="0 0 120 200" className="h-48">
                {[
                  [60, 24, 60, 70],
                  [60, 70, 36, 96],
                  [60, 70, 84, 96],
                  [60, 70, 48, 120],
                  [60, 70, 72, 120],
                  [48, 120, 40, 168],
                  [72, 120, 80, 168],
                ].map(([x1, y1, x2, y2], i) => (
                  <motion.line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--lavender)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
                {[
                  [60, 24],
                  [60, 70],
                  [36, 96],
                  [84, 96],
                  [48, 120],
                  [72, 120],
                  [40, 168],
                  [80, 168],
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="4" fill="var(--neon)" />
                ))}
              </svg>
            </div>

            <div className="relative mt-6 grid gap-2 sm:grid-cols-3">
              {checks.map((c, i) => (
                <motion.div
                  key={c}
                  className="glass flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.5 }}
                >
                  {c}
                  <span className="text-neon">✓</span>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-5">
          <Reveal>
            <Card glow>
              <p className="eyebrow">AI Feedback</p>
              <p className="mt-3 text-lg leading-relaxed">
                “Great depth. Keep your knees aligned with your toes.”
              </p>
            </Card>
          </Reveal>
          <Reveal index={1}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This represents the intended and designed AI capability. Accuracy can vary with
              exercise type, camera angle, lighting and environment.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
