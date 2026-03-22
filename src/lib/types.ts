export type TaskStatus = 'received' | 'transcribing' | 'coding' | 'done' | 'error';

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  summary?: string;
  whatsNext?: string;
  timestamp: Date;
  linesWritten?: number;
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
