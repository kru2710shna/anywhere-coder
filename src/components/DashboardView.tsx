import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { MicButton } from '@/components/MicButton';
import { TaskStatus } from '@/lib/types';
import {
  Code2, ChevronRight, GitCommit, CheckCircle,
  Plus, ArrowRight, FolderOpen, Layers, ArrowLeft, Settings as SettingsIcon,
  Mic, Send, X,
} from 'lucide-react';

const statusConfig: Record<TaskStatus, { label: string; dot: string; bg: string; text: string }> = {
  received: { label: 'Received', dot: 'bg-primary', bg: 'bg-primary/10', text: 'text-primary' },
  transcribing: { label: 'Processing', dot: 'bg-warning', bg: 'bg-warning/10', text: 'text-warning' },
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

export function DashboardView({ onSwitchView, onOpenSettings }: { onSwitchView: () => void; onOpenSettings?: () => void }) {
  const { projects, isOnline, githubConnected, totalLines, micState, addProject, addTask } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const totalCompleted = projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.status === 'done').length, 0);

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    const id = addProject(newProjectTitle.trim());
    setNewProjectTitle('');
    setShowNewProject(false);
    setSelectedProjectId(id);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim() || !selectedProjectId) return;
    addTask(selectedProjectId, newTaskText.trim());
    setNewTaskText('');
    setShowAddTask(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedProject && (
            <button onClick={() => { setSelectedProjectId(null); setExpandedTaskId(null); setShowAddTask(false); }} className="mr-1 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <Code2 className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground truncate">
            {selectedProject ? selectedProject.title : 'Work From Anywhere'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onOpenSettings} className="text-muted-foreground hover:text-foreground transition-colors ml-2"><SettingsIcon className="h-3.5 w-3.5" /></button>
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-success animate-status-pulse' : 'bg-destructive'}`} /><span className="text-[11px] text-muted-foreground ml-3 mr-1">|</span><span className={`h-2 w-2 rounded-full ${githubConnected ? 'bg-success animate-status-pulse' : 'bg-warning'}`} />
          <span className="text-[11px] text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      {/* Stats strip */}
      <div className="flex items-center gap-5 border-b border-border px-4 py-2.5 md:px-6 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{projects.length}</span> projects</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <CheckCircle className="h-3.5 w-3.5 text-success" />
          <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{totalCompleted}</span> done</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{totalLines}</span> lines</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4 md:px-6 md:py-6">
          <AnimatePresence mode="wait">
            {!selectedProject ? (
              /* ===== PROJECT LIST ===== */
              <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-2">
                {projects.map((project) => {
                  const done = project.tasks.filter((t) => t.status === 'done').length;
                  const total = project.tasks.length;
                  const latestTask = project.tasks[0];
                  const hasActive = project.tasks.some((t) => t.status !== 'done' && t.status !== 'error');

                  return (
                    <motion.button
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedProjectId(project.id)}
                      className="flex w-full items-center gap-4 rounded-lg border border-border bg-surface p-4 text-left transition-all hover:border-primary/30 active:scale-[0.98]"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${hasActive ? 'bg-primary/15' : 'bg-muted'}`}>
                        <FolderOpen className={`h-5 w-5 ${hasActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{project.title}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground">{done}/{total} tasks</span>
                          {latestTask && <span className="text-[11px] text-muted-foreground truncate">· {timeAgo(latestTask.timestamp)}</span>}
                        </div>
                        {total > 0 && (
                          <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                            <motion.div className="h-full rounded-full bg-success" initial={{ width: 0 }} animate={{ width: `${(done / total) * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </motion.button>
                  );
                })}

                {/* New project input */}
                <AnimatePresence>
                  {showNewProject && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="flex gap-2 rounded-lg border border-primary/30 bg-surface p-3">
                        <input
                          autoFocus
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleCreateProject(); if (e.key === 'Escape') setShowNewProject(false); }}
                          placeholder="Project name..."
                          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <button onClick={handleCreateProject} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Create</button>
                        <button onClick={() => setShowNewProject(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* ===== INSIDE A PROJECT ===== */
              <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

                {/* Voice assistant section */}
                <div className="mb-6 rounded-lg border border-border bg-surface p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Mic className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice Assistant</span>
                  </div>
                  <div className="flex flex-col items-center py-4">
                    <MicButton state={micState} projectId={selectedProject?.id} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      Simulate Voice Task
                    </button>
                  </div>
                </div>

                {/* Add task input bar */}
                <div className="mb-4">
                  <AnimatePresence>
                    {showAddTask ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="flex gap-2 rounded-lg border border-primary/30 bg-surface p-3">
                          <input
                            autoFocus
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') { setShowAddTask(false); setNewTaskText(''); } }}
                            placeholder="Describe the task..."
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                          />
                          <button onClick={handleAddTask} className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Send className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setShowAddTask(false); setNewTaskText(''); }} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowAddTask(true)}
                        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground active:scale-[0.98]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add a task
                      </button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Task list */}
                {selectedProject.tasks.length === 0 && !showAddTask && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">No tasks yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add a task or use voice to get started</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {selectedProject.tasks.map((task) => {
                    const config = statusConfig[task.status];
                    const isExpanded = expandedTaskId === task.id;
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
                        <button
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all active:scale-[0.98] ${
                            isExpanded ? 'border-border bg-surface' : 'border-transparent hover:bg-surface/50'
                          } ${isActive ? 'border-border bg-surface' : ''}`}
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${config.dot} ${isActive ? 'animate-status-pulse' : ''}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{task.text}</p>
                            <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] text-muted-foreground">{timeAgo(task.timestamp)}</span>
                              <span className={`rounded-badge px-1.5 py-0.5 text-[10px] font-medium ${config.bg} ${config.text}`}>{config.label}</span>
                              {task.linesWritten && <span className="text-[10px] text-muted-foreground">+{task.linesWritten} lines</span>}
                            </div>
                          </div>
                          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                              <div className="rounded-b-lg border border-t-0 border-border bg-surface px-4 pb-4 pt-2 -mt-1">
                                {task.summary && (
                                  <div className="mb-4">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Summary</p>
                                    <p className="text-sm leading-relaxed text-foreground">{task.summary}</p>
                                  </div>
                                )}
                                {task.whatsNext && (
                                  <div className="mb-4 flex items-start gap-2 rounded-md bg-primary/5 border border-primary/10 px-3 py-2.5">
                                    <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground leading-relaxed">{task.whatsNext}</p>
                                  </div>
                                )}
                                {task.commitHash && (
                                  <div className="mb-4 flex items-center gap-2">
                                    <GitCommit className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="font-mono text-[11px] text-primary">{task.commitHash}</span>
                                    <span className="text-xs text-muted-foreground truncate">{task.commitMessage}</span>
                                  </div>
                                )}
                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Log</p>
                                  <div className="space-y-0.5">
                                    {task.logs.map((log, i) => (
                                      <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} className={`border-l-2 ${logBorderColors[log.type]} pl-3 py-1`}>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-status-pulse" />
          <span className="text-[11px] text-muted-foreground">Agent connected</span>
        </div>
        <button onClick={onSwitchView} className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors md:hidden">Voice mode</button>
      </footer>

      {/* FAB - only on project list */}
      {!selectedProject && (
        <motion.button
          onClick={() => setShowNewProject(true)}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-16 right-4 flex items-center gap-2 rounded-full bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors md:bottom-6 md:right-6 md:rounded-lg md:px-4 md:py-2.5"
        >
          <Plus className="h-5 w-5 md:h-4 md:w-4" />
          <span className="hidden md:inline text-sm font-medium">New Project</span>
        </motion.button>
      )}
    </div>
  );
}
