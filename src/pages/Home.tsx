import { motion } from 'framer-motion';
import { Code2, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { session } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
            Work From Anywhere
          </span>
        </div>
        <Link
          to={session ? '/dashboard' : '/auth'}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          {session ? 'Dashboard' : 'Sign in'}
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-badge border border-border bg-surface px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-status-pulse" />
            <span className="text-xs text-muted-foreground">Agent online — ready to code</span>
          </div>

          <h1
            className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Your AI dev team,
            <br />
            <span className="text-primary">anywhere you go</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
            style={{ textWrap: 'pretty' } as React.CSSProperties}
          >
            Speak your ideas. Watch them become code. A voice-controlled coding agent that works while you're on the move.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={session ? '/dashboard' : '/auth'}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 grid max-w-3xl gap-6 sm:grid-cols-3"
        >
          {[
            { icon: Zap, title: 'Voice-first', desc: 'Speak commands naturally and watch code appear in real-time' },
            { icon: Globe, title: 'Work anywhere', desc: 'From your phone, tablet, or laptop — your agent is always ready' },
            { icon: Shield, title: 'Full visibility', desc: 'Live dashboard shows every file change, commit, and decision' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-surface p-5 text-left">
              <Icon className="mb-3 h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        Built with voice, powered by AI
      </footer>
    </div>
  );
}
