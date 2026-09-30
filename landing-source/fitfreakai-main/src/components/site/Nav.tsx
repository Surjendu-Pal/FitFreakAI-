import { useEffect, useState } from "react";

const links = [
  { label: "Problem", href: "#problem" },
  { label: "AI", href: "#ai" },
  { label: "Privacy", href: "#privacy" },
  { label: "Features", href: "#features" },
  { label: "Technology", href: "#architecture" },
  { label: "Ecosystem", href: "#ecosystem" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "glass py-3" : "py-5"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 md:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className="grid size-8 place-items-center rounded-lg font-display text-sm font-extrabold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-violet)" }}
          >
            F
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            FitFreak <span className="text-lavender">AI</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-lavender"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#ecosystem"
            className="hidden rounded-full px-5 py-2.5 font-display text-xs font-semibold tracking-wide text-primary-foreground transition-transform hover:scale-[1.04] md:inline-flex"
            style={{ backgroundImage: "var(--gradient-violet)" }}
          >
            EXPLORE
          </a>
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="glass grid size-9 place-items-center rounded-lg md:hidden"
          >
            <span className="flex flex-col gap-1">
              <span className="block h-0.5 w-4 rounded bg-foreground" />
              <span className="block h-0.5 w-4 rounded bg-foreground" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="glass mx-5 mt-3 grid gap-1 rounded-2xl p-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
