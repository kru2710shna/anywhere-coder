import { create } from 'zustand';
import { Task, GitCommit, ActivityLog, MicState } from './types';
import { initialTasks, initialCommits, initialActivityLogs, getNextSimulatedTask } from './mock-data';

interface AppState {
  tasks: Task[];
  commits: GitCommit[];
  activityLogs: ActivityLog[];
  micState: MicState;
  isOnline: boolean;
  totalLines: number;
  setMicState: (state: MicState) => void;
  simulateTask: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: initialTasks,
  commits: initialCommits,
  activityLogs: initialActivityLogs,
  micState: 'idle',
  isOnline: true,
  totalLines: 47,
  setMicState: (micState) => set({ micState }),
  simulateTask: () => {
    const sim = getNextSimulatedTask();
    const id = crypto.randomUUID();
    const now = new Date();

    // Phase 1: received
    set((s) => ({
      micState: 'recording',
      activityLogs: [
        { id: `${id}-r`, message: `Received task: "${sim.text}"`, type: 'received', timestamp: now },
        ...s.activityLogs,
      ],
      tasks: [
        { id, text: sim.text, status: 'received', timestamp: now },
        ...s.tasks,
      ],
    }));

    // Phase 2: transcribing
    setTimeout(() => {
      set((s) => ({
        micState: 'processing',
        activityLogs: [
          { id: `${id}-t`, message: 'Transcribing voice...', type: 'processing', timestamp: new Date() },
          ...s.activityLogs,
        ],
        tasks: s.tasks.map((t) => t.id === id ? { ...t, status: 'transcribing' as const } : t),
      }));
    }, 800);

    // Phase 3: coding
    setTimeout(() => {
      set((s) => ({
        activityLogs: [
          { id: `${id}-c`, message: `Asking Claude to ${sim.text.toLowerCase()}...`, type: 'processing', timestamp: new Date() },
          ...s.activityLogs,
        ],
        tasks: s.tasks.map((t) => t.id === id ? { ...t, status: 'coding' as const } : t),
      }));
    }, 2000);

    // Phase 4: done
    setTimeout(() => {
      const hash = Math.random().toString(36).substring(2, 9);
      set((s) => ({
        micState: 'done',
        totalLines: s.totalLines + sim.lines,
        activityLogs: [
          { id: `${id}-d`, message: `Committed: ${sim.commit}`, type: 'done', timestamp: new Date() },
          { id: `${id}-w`, message: `Writing ${Math.ceil(sim.lines / 10)} files...`, type: 'processing', timestamp: new Date() },
          ...s.activityLogs,
        ],
        tasks: s.tasks.map((t) =>
          t.id === id
            ? { ...t, status: 'done' as const, summary: sim.summary, whatsNext: sim.whatsNext, linesWritten: sim.lines }
            : t
        ),
        commits: [{ hash, message: sim.commit }, ...s.commits].slice(0, 5),
      }));
    }, 3500);

    // Phase 5: back to idle
    setTimeout(() => {
      set({ micState: 'idle' });
    }, 4500);
  },
}));
