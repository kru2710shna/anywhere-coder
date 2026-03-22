import { motion } from "framer-motion";
import { Mic, ArrowRight, Code2, GitCommit, Smartphone } from "lucide-react";

interface HomeProps {
  onEnter: () => void;
}

const features = [
  { icon: Mic, title: "Speak your intent", desc: "Press mic on your phone and describe what to build. No typing, no IDE, no desk." },
  { icon: Code2, title: "Claude codes it", desc: "Your laptop agent receives the task, calls Claude, writes files, and commits to git." },
  { icon: GitCommit, title: "Get a summary back", desc: "What was done, what's next — pushed back to your phone in seconds." },
];

const steps = [
  { label: "You say", value: '"Add a dark navbar with Home, About, Contact"' },
  { label: "Claude writes", value: "Navbar.tsx · App.css · 3 files · 47 lines" },
  { label: "Git commits", value: "feat: add dark navbar with nav links" },
  { label: "You hear", value: '"Done. Navbar added. Next: add mobile menu?"' },
];

export default function Home({ onEnter }: HomeProps) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      <nav className="flex items-center justify-between px-6 py-4 border-b border-border max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Work From Anywhere</span>
        </div>
        <button
          onClick={onEnter}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary transition-all"
        >
          Open app <ArrowRight className="h-3 w-3" />
        </button>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-status-pulse" />
            <span className="text-[11px] font-medium text-primary tracking-wide">Voice → Code → Git. Fully automated.</span>
          </div>

          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Your AI dev team,<br />
            <span className="text-primary">always coding at home.</span>
          </h1>

          <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Speak a task from your phone. Claude Code runs on your laptop, writes the code, commits to git, and sends you a summary — all while you are on the move.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={onEnter}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Mic className="h-4 w-4" />
              Open the app
            </motion.button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
            >
              View on GitHub <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-border bg-surface/50 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-6">How a task flows</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative rounded-lg border border-border bg-background p-4"
              >
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground hidden sm:block z-10" />
                )}
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">{step.label}</p>
                <p className="text-xs text-foreground leading-relaxed font-mono">{step.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 max-w-4xl mx-auto">
        <p className="text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-10">What it does</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-2">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
        <div className="rounded-xl border border-border bg-surface p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-mic-pulse">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Ready to build from anywhere?</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Open the app, create a project, and speak your first task. Your laptop agent handles the rest.
          </p>
          <motion.button
            onClick={onEnter}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Mic className="h-4 w-4" />
            Get started
          </motion.button>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="text-[11px] text-muted-foreground">
          Built for LevelNext Hackathon · Work From Anywhere · Mar 2026
        </p>
      </footer>
    </div>
  );
}
