export type TaskStatus = 'received' | 'transcribing' | 'coding' | 'done' | 'error';

export interface TaskLog {
  id: string;
  message: string;
  type: 'received' | 'processing' | 'done' | 'error';
  timestamp: Date;
}

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  summary?: string;
  whatsNext?: string;
  timestamp: Date;
  linesWritten?: number;
  commitHash?: string;
  commitMessage?: string;
  logs: TaskLog[];
}

export interface GitCommit {
  hash: string;
  message: string;
}

export type MicState = 'idle' | 'recording' | 'processing' | 'done';

export interface ActivityLog {
  id: string;
  message: string;
  type: 'received' | 'processing' | 'done' | 'error';
  timestamp: Date;
}
