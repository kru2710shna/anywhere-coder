import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { MicButton } from '@/components/MicButton';
import { TaskStatus } from '@/lib/types';
import { Code2, ChevronDown, ChevronRight, GitCommit, CheckCircle, Clock, Plus, ArrowRight } from 'lucide-react';

const statusConfig: Record<TaskStatus, { label: string; dot: string; bg: string; text: string }> = {
  received: { label: 'Received', dot: 'bg-primary', bg: 'bg-primary/10', text: 'text-primary' },
  transcribing: { label: 'Transcribing', dot: 'bg-warning', bg: 'bg-warning/10', text: 'text-warning' },
  coding: { label: 'Coding', dot: 'bg-warning', bg: 'bg-warning/10', text: 'text-warning' },
  done: { label: 'Done', dot: 'bg-success', bg: 'bg-success/10', text: 'text-success' },
  error: { label: 'Error', dot: 'bg-destructive', bg: 'bg-destructive/10', text: 'text-destructive' },
};

const logBorderColors = {
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

export function DashboardView({ onSwitchView }: { onSwitchView: () => void }) {
  const { tasks, isOnline, totalLines, micState, simulateTask } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
            Work From Anywhere
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-success animate-status-pulse' : 'bg-destructive'}`} />
          <span className="text-[11px] text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      {/* Stats strip */}
      <div className="flex items-center gap-6 border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-success" />
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{completedTasks}</span> tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{totalLines}</span> lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">2m ago</span>
        </div>
      </div>

      {/* Mic button - mobile only */}
      <div className="flex justify-center py-6 md:hidden">
        <MicButton state={micState} />
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4 md:px-6 md:py-6">
          <AnimatePresence initial={false}>
            {tasks.map((task) => {
              const config = statusConfig[task.status];
              const isExpanded = expandedId === task.id;
              const isActive = task.status !== 'done' && task.status !== 'error';

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-2"
                >
                  {/* Task row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : task.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all active:scale-[0.98] ${
                      isExpanded
                        ? 'border-border bg-surface'
                        : 'border-transparent hover:bg-surface/50'
                    } ${isActive ? 'border-border bg-surface' : ''}`}
                  >
                    {/* Status dot */}
                    <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot} ${isActive ? 'animate-status-pulse' : ''}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.text}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{timeAgo(task.timestamp)}</span>
                        <span className={`rounded-badge px-1.5 py-0.5 text-[10px] font-medium ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                        {task.linesWritten && (
                          <span className="text-[10px] text-muted-foreground">+{task.linesWritten} lines</span>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-muted-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-b-lg border border-t-0 border-border bg-surface px-4 pb-4 pt-2 -mt-1">
                          {/* Summary */}
                          {task.summary && (
                            <div className="mb-4">
                              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Summary</p>
                              <p className="text-sm leading-relaxed text-foreground">{task.summary}</p>
                            </div>
                          )}

                          {/* What's next */}
                          {task.whatsNext && (
                            <div className="mb-4 flex items-start gap-2 rounded-md bg-primary/5 border border-primary/10 px-3 py-2.5">
                              <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <p className="text-xs text-foreground leading-relaxed">{task.whatsNext}</p>
                            </div>
                          )}

                          {/* Commit */}
                          {task.commitHash && (
                            <div className="mb-4 flex items-center gap-2">
                              <GitCommit className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="font-mono text-[11px] text-primary">{task.commitHash}</span>
                              <span className="text-xs text-muted-foreground truncate">{task.commitMessage}</span>
                            </div>
                          )}

                          {/* Logs */}
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Activity Log</p>
                            <div className="space-y-0.5">
                              {task.logs.map((log, i) => (
                                <motion.div
                                  key={log.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: i * 0.05 }}
                                  className={`border-l-2 ${logBorderColors[log.type]} pl-3 py-1`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                      {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                    <span className="text-xs text-foreground">{log.message}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-status-pulse" />
          <span className="text-[11px] text-muted-foreground">Agent connected</span>
        </div>
        <button onClick={onSwitchView} className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors md:hidden">
          Voice mode
        </button>
      </footer>

      {/* Simulate button */}
      <motion.button
        onClick={simulateTask}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-16 right-4 flex items-center gap-2 rounded-full bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors md:bottom-6 md:right-6 md:rounded-lg md:px-4 md:py-2.5"
      >
        <Plus className="h-5 w-5 md:h-4 md:w-4" />
        <span className="hidden md:inline text-sm font-medium">Simulate Task</span>
      </motion.button>
    </div>
  );
}
