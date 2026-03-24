import { MicButton } from '@/components/MicButton';
import { TaskCard } from '@/components/TaskCard';
import { useAppStore } from '@/lib/store';

interface MobileViewProps {
  onSwitchView: () => void;
}

export function MobileView({ onSwitchView }: MobileViewProps) {
  const { projects, micState } = useAppStore();
  const allTasks = projects.flatMap((p) => p.tasks).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
          Work From Anywhere
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">your AI dev team — anywhere</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center -mt-12">
        <MicButton state={micState} />
      </div>

      <div className="mt-8 flex-1 space-y-3 overflow-y-auto max-h-[40vh]">
        {allTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <button
        onClick={onSwitchView}
        className="mt-6 text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
      >
        View Dashboard
      </button>
    </div>
  );
}
