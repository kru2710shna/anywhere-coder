import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Wifi, Github, FolderOpen, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const steps = [
  { id: 1, icon: Wifi, title: 'Connect relay', desc: 'Make sure your local relay server is running' },
  { id: 2, icon: Github, title: 'GitHub access', desc: 'Enter your GitHub token and target repo' },
  { id: 3, icon: FolderOpen, title: 'Workspace', desc: 'Set the local folder where files get written' },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { checkRelayHealth, checkGithubConnection, saveSettings, completeOnboarding, isOnline, githubConnected } = useAppStore();
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(false);
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [username, setUsername] = useState('');
  const [workspace, setWorkspace] = useState('/Users/yourname/anywhere-coder/workspace');
  const [error, setError] = useState('');

  const handleStep1 = async () => {
    setChecking(true);
    setError('');
    await checkRelayHealth();
    setChecking(false);
    if (useAppStore.getState().isOnline) {
      setStep(2);
    } else {
      setError('Relay not reachable. Run: cd relay && python -m uvicorn main:app --port 8000');
    }
  };

  const handleStep2 = async () => {
    if (!token || !repo || !username) { setError('All fields required'); return; }
    setChecking(true);
    setError('');
    saveSettings({ githubToken: token, githubRepo: repo, githubUsername: username });
    await checkGithubConnection();
    setChecking(false);
    if (useAppStore.getState().githubConnected) {
      setStep(3);
    } else {
      setError('Could not connect to GitHub. Check your token has repo scope.');
    }
  };

  const handleStep3 = () => {
    if (!workspace) { setError('Workspace path required'); return; }
    saveSettings({ workspaceDir: workspace });
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Code2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Work From Anywhere</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all ${
                step > s.id ? 'bg-success text-success-foreground' :
                step === s.id ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
              </div>
              {s.id < steps.length && (
                <div className={`h-px w-8 transition-all ${step > s.id ? 'bg-success' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1 — Relay */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wifi className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Start your relay server</p>
                  <p className="text-xs text-muted-foreground">Required to process voice tasks</p>
                </div>
              </div>
              <div className="mb-4 rounded-lg bg-muted/50 border border-border p-3">
                <p className="text-[11px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">Run in terminal</p>
                <code className="text-xs text-primary font-mono">cd relay && python -m uvicorn main:app --port 8000</code>
              </div>
              {error && <p className="text-xs text-destructive mb-3">{error}</p>}
              <button onClick={handleStep1} disabled={checking}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wifi className="h-4 w-4" /> Check connection</>}
              </button>
            </motion.div>
          )}

          {/* Step 2 — GitHub */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Github className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Connect GitHub</p>
                  <p className="text-xs text-muted-foreground">Claude will commit code here</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">GitHub username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="kru2710shna"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Repository (user/repo)</label>
                  <input value={repo} onChange={(e) => setRepo(e.target.value)}
                    placeholder="kru2710shna/wfa-workspace"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Personal access token
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline normal-case">Generate →</a>
                  </label>
                  <input value={token} onChange={(e) => setToken(e.target.value)}
                    type="password" placeholder="ghp_xxxxxxxxxxxx"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
                  <p className="mt-1 text-[10px] text-muted-foreground">Needs repo scope. Stored locally only.</p>
                </div>
              </div>
              {error && <p className="text-xs text-destructive mb-3">{error}</p>}
              <button onClick={handleStep2} disabled={checking}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Github className="h-4 w-4" /> Verify access</>}
              </button>
            </motion.div>
          )}

          {/* Step 3 — Workspace */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Set workspace folder</p>
                  <p className="text-xs text-muted-foreground">Where Claude writes files on your laptop</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Absolute path</label>
                <input value={workspace} onChange={(e) => setWorkspace(e.target.value)}
                  placeholder="/Users/yourname/anywhere-coder/workspace"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono" />
                <p className="mt-1 text-[10px] text-muted-foreground">This folder is your git repo. Claude writes here and pushes to GitHub.</p>
              </div>
              {error && <p className="text-xs text-destructive mb-3">{error}</p>}
              <button onClick={handleStep3}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-medium text-success-foreground hover:bg-success/90 transition-colors">
                <Check className="h-4 w-4" /> All set — launch app
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Settings are stored locally in your browser. Your token never leaves your machine.
        </p>
      </div>
    </div>
  );
}
