import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, FolderOpen, Save, Check, ExternalLink, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Settings({ onBack }: { onBack: () => void }) {
  const { settings, saveSettings, checkGithubConnection, githubConnected } = useAppStore();
  const [token, setToken] = useState(settings.githubToken);
  const [repo, setRepo] = useState(settings.githubRepo);
  const [username, setUsername] = useState(settings.githubUsername);
  const [workspace, setWorkspace] = useState(settings.workspaceDir);
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    if (!showConfirm) { setShowConfirm(true); setTimeout(() => setShowConfirm(false), 3000); return; }
    saveSettings({ githubToken: "", githubRepo: "", githubUsername: "", workspaceDir: "", onboardingComplete: false });
    localStorage.clear();
    window.location.reload();
  };

  const handleSave = async () => {
    saveSettings({ githubToken: token, githubRepo: repo, githubUsername: username, workspaceDir: workspace });
    setChecking(true);
    await checkGithubConnection();
    setChecking(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-[0.15em]">Settings</span>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">

        {/* Status bar */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">Connection status</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${useAppStore.getState().isOnline ? 'bg-success animate-status-pulse' : 'bg-destructive'}`} />
              <span className="text-xs text-muted-foreground">Relay {useAppStore.getState().isOnline ? 'online' : 'offline'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${githubConnected ? 'bg-success animate-status-pulse' : 'bg-destructive'}`} />
              <span className="text-xs text-muted-foreground">GitHub {githubConnected ? 'connected' : 'not connected'}</span>
            </div>
          </div>
        </div>

        {/* GitHub settings */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-4">
            <Github className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">GitHub</p>
            {githubConnected && (
              <span className="ml-auto text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full">Connected</span>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Repository</label>
              <div className="flex gap-2 mt-1">
                <input value={repo} onChange={(e) => setRepo(e.target.value)}
                  placeholder="username/repo-name"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                {repo && (
                  <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-lg border border-border bg-muted px-3 hover:border-primary/30 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Personal access token</label>
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline">Generate new →</a>
              </div>
              <input value={token} onChange={(e) => setToken(e.target.value)}
                type="password" placeholder="ghp_xxxxxxxxxxxx"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50" />
              <p className="mt-1 text-[10px] text-muted-foreground">Needs repo scope. Never sent to any server.</p>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Workspace</p>
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Local folder path</label>
            <input value={workspace} onChange={(e) => setWorkspace(e.target.value)}
              placeholder="/Users/yourname/anywhere-coder/workspace"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50" />
            <p className="mt-1 text-[10px] text-muted-foreground">Claude writes files here and pushes to your GitHub repo.</p>
          </div>
        </div>

        {/* Save */}
        <motion.button onClick={handleSave} whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          {saved ? <><Check className="h-4 w-4" /> Saved!</> : checking ? 'Verifying...' : <><Save className="h-4 w-4" /> Save settings</>}
        </motion.button>

        <p className="text-center text-[11px] text-muted-foreground">
          All settings stored locally in your browser only.
          <button
            onClick={handleReset}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${showConfirm
                ? 'border-destructive text-destructive hover:bg-destructive/5'
                : 'border-border text-muted-foreground hover:text-foreground'
              }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {showConfirm ? 'Click again to confirm reset' : 'Reset & reconfigure'}
          </button>
        </p>
      </div>
    </div>
  );
}
