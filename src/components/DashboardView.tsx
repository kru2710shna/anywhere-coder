import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Code2, Clock, GitCommit } from 'lucide-react';

const borderColors = {
  received: 'border-l-primary',
  processing: 'border-l-warning',
  done: 'border-l-success',
  error: 'border-l-destructive',
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 align-middle" style={{ animation: 'typewriter-cursor 0.7s step-end infinite' }} />
      )}
    </span>
  );
}

export function DashboardView({ onSwitchView }: { onSwitchView: () => void }) {
  const { tasks, commits, activityLogs, isOnline, totalLines, simulateTask } = useAppStore();
  const feedRef = useRef<HTMLDivElement>(null);
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const latestTask = tasks[0];

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [activityLogs.length]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">Work From Anywhere</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-success animate-status-pulse' : 'bg-destructive'}`} />
          <span className="text-xs text-muted-foreground">{isOnline ? 'Agent Online' : 'Agent Offline'}</span>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 px-6 py-5">
        {[
          { icon: CheckCircle, label: 'Tasks completed', value: completedTasks },
          { icon: Code2, label: 'Lines of code', value: totalLines },
          { icon: Clock, label: 'Last active', value: '2 min ago' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 px-6 pb-6 min-h-0">
        {/* Activity Feed */}
        <div className="flex flex-col w-[60%] rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Activity</h2>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-1">
            {activityLogs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, delay: i < 3 ? i * 0.08 : 0, ease: [0.16, 1, 0.3, 1] }}
                className={`border-l-2 ${borderColors[log.type]} pl-3 py-1.5`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">{log.timestamp.toLocaleTimeString()}</span>
                  <span className="text-xs text-foreground">{log.message}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col w-[40%] gap-4">
          {/* Latest Task */}
          <div className="flex-1 rounded-lg border border-border bg-surface p-4 overflow-y-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Latest Task</h2>
            {latestTask && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Voice command</p>
                  <p className="text-sm font-medium text-foreground">"{latestTask.text}"</p>
                </div>
                {latestTask.summary && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">What was done</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      <TypewriterText text={latestTask.summary} />
                    </p>
                  </div>
                )}
                {latestTask.whatsNext && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">What's next</p>
                    <p className="text-sm text-foreground">{latestTask.whatsNext}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Git Log */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Commits</h2>
            <div className="space-y-2">
              {commits.slice(0, 5).map((c) => (
                <div key={c.hash} className="flex items-start gap-2">
                  <GitCommit className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-primary shrink-0">{c.hash}</span>
                    <span className="text-xs text-muted-foreground truncate">{c.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-status-pulse" />
          <span className="text-xs text-muted-foreground">Laptop agent: connected</span>
        </div>
        <button onClick={onSwitchView} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors md:hidden">
          View Mobile
        </button>
      </footer>

      {/* Simulate Button */}
      <motion.button
        onClick={simulateTask}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
      >
        Simulate Task
      </motion.button>
    </div>
  );
}
