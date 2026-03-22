import { MicButton } from '@/components/MicButton';
import { TaskCard } from '@/components/TaskCard';
import { useAppStore } from '@/lib/store';

interface MobileViewProps {
  onSwitchView: () => void;
}

export function MobileView({ onSwitchView }: MobileViewProps) {
  const { tasks, micState } = useAppStore();

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
          Work From Anywhere
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">your AI dev team — anywhere</p>
      </div>

      {/* Mic */}
      <div className="flex flex-1 flex-col items-center justify-center -mt-12">
        <MicButton state={micState} />
      </div>

      {/* Status Feed */}
      <div className="mt-8 flex-1 space-y-3 overflow-y-auto max-h-[40vh]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* Footer */}
      <button
        onClick={onSwitchView}
        className="mt-6 text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
      >
        View Dashboard
      </button>
    </div>
  );
}
