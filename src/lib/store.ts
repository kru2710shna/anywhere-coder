import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, GitCommit, ActivityLog, MicState, Task, AppSettings } from './types';
import { initialProjects, initialCommits, initialActivityLogs } from './mock-data';

const RELAY_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000';

const defaultSettings: AppSettings = {
  githubToken: '',
  githubRepo: '',
  githubUsername: '',
  workspaceDir: '',
  onboardingComplete: false,
};

interface AppState {
  projects: Project[];
  commits: GitCommit[];
  activityLogs: ActivityLog[];
  micState: MicState;
  isOnline: boolean;
  githubConnected: boolean;
  totalLines: number;
  settings: AppSettings;
  setMicState: (state: MicState) => void;
  addProject: (title: string) => string;
  addTask: (projectId: string, text: string) => void;
  submitVoiceTask: (projectId: string, text: string) => void;
  checkRelayHealth: () => void;
  checkGithubConnection: () => void;
  saveSettings: (s: Partial<AppSettings>) => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: initialProjects,
      commits: initialCommits,
      activityLogs: initialActivityLogs,
      micState: 'idle',
      isOnline: false,
      githubConnected: false,
      totalLines: 47,
      settings: defaultSettings,

      setMicState: (micState) => set({ micState }),

      saveSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      completeOnboarding: () =>
        set((state) => ({
          settings: { ...state.settings, onboardingComplete: true },
        })),

      checkRelayHealth: async () => {
        try {
          const res = await fetch(`${RELAY_URL}/health`);
          const data = await res.json();
          set({ isOnline: data.status === 'online' });
        } catch {
          set({ isOnline: false });
        }
      },

      checkGithubConnection: async () => {
        const { settings } = get();
        if (!settings.githubToken || !settings.githubRepo) {
          set({ githubConnected: false });
          return;
        }
        try {
          const res = await fetch(
            `https://api.github.com/repos/${settings.githubRepo}`,
            { headers: { Authorization: `token ${settings.githubToken}` } }
          );
          set({ githubConnected: res.ok });
        } catch {
          set({ githubConnected: false });
        }
      },

      addProject: (title: string) => {
        const id = crypto.randomUUID();
        set((s) => ({
          projects: [{ id, title, tasks: [], createdAt: new Date() }, ...s.projects],
        }));
        return id;
      },

      addTask: (projectId: string, text: string) => {
        get().submitVoiceTask(projectId, text);
      },

      submitVoiceTask: async (projectId: string, text: string) => {
        const taskId = crypto.randomUUID();
        const sessionId = crypto.randomUUID();
        const now = new Date();

        const addLog = (message: string, type: Task['logs'][0]['type']) => {
          set((s) => ({
            projects: s.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    tasks: p.tasks.map((t) =>
                      t.id === taskId
                        ? {
                            ...t,
                            logs: [
                              { id: crypto.randomUUID(), message, type, timestamp: new Date() },
                              ...t.logs,
                            ],
                          }
                        : t
                    ),
                  }
                : p
            ),
          }));
        };

        const updateTask = (patch: Partial<Task>) => {
          set((s) => ({
            projects: s.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    tasks: p.tasks.map((t) =>
                      t.id === taskId ? { ...t, ...patch } : t
                    ),
                  }
                : p
            ),
          }));
        };

        set((s) => ({
          micState: 'processing',
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: [
                    {
                      id: taskId,
                      text,
                      status: 'received' as const,
                      timestamp: now,
                      logs: [
                        {
                          id: `${taskId}-r`,
                          message: 'Task received',
                          type: 'received' as const,
                          timestamp: now,
                        },
                      ],
                    },
                    ...p.tasks,
                  ],
                }
              : p
          ),
        }));

        try {
          const ws = new WebSocket(`${WS_URL}/ws/${sessionId}`);

          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.status === 'transcribing') {
              updateTask({ status: 'transcribing' });
              addLog(data.message || 'Processing...', 'processing');
            }

            if (data.status === 'coding') {
              updateTask({ status: 'coding' });
              addLog(data.message || 'Claude is coding...', 'processing');
            }

            if (data.status === 'done') {
              const fileKeys = data.files ? Object.keys(data.files) : [];
              const linesWritten = (data.files_written || 1) * 15;
              updateTask({
                status: 'done',
                summary: data.summary,
                whatsNext: data.whats_next,
                linesWritten,
                commitHash: data.commit_hash,
                commitMessage: data.commit_message,
                filesWritten: fileKeys,
              });
              addLog(`Committed: ${data.commit_message || 'changes pushed'}`, 'done');
              set((s) => ({
                micState: 'done',
                totalLines: s.totalLines + linesWritten,
                commits: [
                  {
                    hash: data.commit_hash || 'unknown',
                    message: data.commit_message || text,
                  },
                  ...s.commits,
                ].slice(0, 5),
              }));
              setTimeout(() => set({ micState: 'idle' }), 2000);

              if (Notification.permission === 'granted') {
                new Notification('Work From Anywhere', {
                  body: `Done — ${data.summary}`,
                  icon: '/favicon.ico',
                });
              }
              ws.close();
            }

            if (data.status === 'error') {
              updateTask({ status: 'error' });
              addLog(`Error: ${data.message}`, 'error');
              set({ micState: 'idle' });
              ws.close();
            }
          };

          ws.onerror = () => {
            addLog('WebSocket connection failed', 'error');
            set({ micState: 'idle' });
          };

          ws.onopen = async () => {
            try {
              await fetch(`${RELAY_URL}/task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  task: text,
                  project_id: projectId,
                  session_id: sessionId,
                }),
              });
            } catch {
              addLog('Failed to reach relay server', 'error');
              set({ micState: 'idle' });
              ws.close();
            }
          };
        } catch {
          set({ micState: 'idle' });
        }

        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      },
    }),
    {
      name: 'wfa-storage',
      partialize: (state) => ({
        settings: state.settings,
        projects: state.projects,
        commits: state.commits,
        totalLines: state.totalLines,
      }),
    }
  )
);