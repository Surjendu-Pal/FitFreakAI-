const footerLinks = [
  { label: "About", href: "#problem" },
  { label: "AI", href: "#ai" },
  { label: "Privacy", href: "#privacy" },
  { label: "Features", href: "#features" },
  { label: "Technology", href: "#architecture" },
  { label: "Contact", href: "#cta" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border px-5 py-16 md:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="grid size-9 place-items-center rounded-lg font-display text-sm font-extrabold text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-violet)" }}
            >
              F
            </span>
            <span className="font-display text-lg font-bold">
              FITFREAK <span className="text-lavender">AI</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            AI-Powered Adaptive &amp; Gamified Fitness Wellness Ecosystem.
          </p>
          <a
            href="https://github.com/Surjendu-Pal/FitFreak-AI"
            target="_blank"
            rel="noreferrer"
            className="glass mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:text-lavender"
          >
            View on GitHub
          </a>
        </div>

        <div>
          <p className="eyebrow mb-4">Navigate</p>
          <ul className="grid gap-2.5">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-lavender"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Built For</p>
          <ul className="grid gap-2.5 text-sm text-muted-foreground">
            <li>Smart India Hackathon 2026</li>
            <li>
              Problem Statement <span className="text-lavender">SIH196</span>
            </li>
            <li>Theme: Fitness &amp; Sports</li>
            <li>
              Team <span className="text-lavender">FitFreak AI</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 w-full max-w-7xl">
        <div className="divider-line" />
        <p className="mt-6 text-xs text-muted-foreground">
          FitFreak AI provides general fitness and wellness guidance only. It does not diagnose
          conditions or replace qualified medical care.
        </p>
      </div>
    </footer>
  );
}
