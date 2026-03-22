import { Task } from '@/lib/types';
import { motion } from 'framer-motion';

const statusConfig = {
  received: { label: 'Received', className: 'bg-primary/20 text-primary' },
  transcribing: { label: 'Transcribing', className: 'bg-warning/20 text-warning' },
  coding: { label: 'Coding', className: 'bg-warning/20 text-warning' },
  done: { label: 'Done', className: 'bg-success/20 text-success' },
  error: { label: 'Error', className: 'bg-destructive/20 text-destructive' },
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function TaskCard({ task }: { task: Task }) {
  const config = statusConfig[task.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{timeAgo(task.timestamp)}</span>
        <span className={`rounded-badge px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
          {config.label}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">{task.text}</p>
      {task.summary && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">{task.summary}</p>
      )}
    </motion.div>
  );
}
