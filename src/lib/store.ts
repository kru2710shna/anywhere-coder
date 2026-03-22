import { create } from 'zustand';
import { Project, GitCommit, ActivityLog, MicState } from './types';
import { initialProjects, initialCommits, initialActivityLogs, getNextSimulatedTask } from './mock-data';

interface AppState {
  projects: Project[];
  commits: GitCommit[];
  activityLogs: ActivityLog[];
  micState: MicState;
  isOnline: boolean;
  totalLines: number;
  setMicState: (state: MicState) => void;
  simulateTask: (projectId: string) => void;
  addProject: (title: string) => string;
}

export const useAppStore = create<AppState>((set) => ({
  projects: initialProjects,
  commits: initialCommits,
  activityLogs: initialActivityLogs,
  micState: 'idle',
  isOnline: true,
  totalLines: 47,
  setMicState: (micState) => set({ micState }),

  addProject: (title: string) => {
    const id = crypto.randomUUID();
    set((s) => ({
      projects: [{ id, title, tasks: [], createdAt: new Date() }, ...s.projects],
    }));
    return id;
  },

  simulateTask: (projectId: string) => {
    const sim = getNextSimulatedTask();
    const taskId = crypto.randomUUID();
    const now = new Date();

    set((s) => ({
      micState: 'recording',
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                {
                  id: taskId,
                  text: sim.text,
                  status: 'received' as const,
                  timestamp: now,
                  logs: [{ id: `${taskId}-r`, message: 'Received task', type: 'received' as const, timestamp: now }],
                },
                ...p.tasks,
              ],
            }
          : p
      ),
    }));

    setTimeout(() => {
      set((s) => ({
        micState: 'processing',
        projects: s.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        status: 'transcribing' as const,
                        logs: [{ id: `${taskId}-t`, message: 'Transcribing voice...', type: 'processing' as const, timestamp: new Date() }, ...t.logs],
                      }
                    : t
                ),
              }
            : p
        ),
      }));
    }, 800);

    setTimeout(() => {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        status: 'coding' as const,
                        logs: [{ id: `${taskId}-c`, message: `Asking Claude to ${sim.text.toLowerCase()}...`, type: 'processing' as const, timestamp: new Date() }, ...t.logs],
                      }
                    : t
                ),
              }
            : p
        ),
      }));
    }, 2000);

    setTimeout(() => {
      const hash = Math.random().toString(36).substring(2, 9);
      set((s) => ({
        micState: 'done',
        totalLines: s.totalLines + sim.lines,
        projects: s.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        status: 'done' as const,
                        summary: sim.summary,
                        whatsNext: sim.whatsNext,
                        linesWritten: sim.lines,
                        commitHash: hash,
                        commitMessage: sim.commit,
                        logs: [
                          { id: `${taskId}-d`, message: `Committed: ${sim.commit}`, type: 'done' as const, timestamp: new Date() },
                          ...t.logs,
                        ],
                      }
                    : t
                ),
              }
            : p
        ),
        commits: [{ hash, message: sim.commit }, ...s.commits].slice(0, 5),
      }));
    }, 3500);

    setTimeout(() => set({ micState: 'idle' }), 4500);
  },
}));
