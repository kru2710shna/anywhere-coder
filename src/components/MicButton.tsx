import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Check } from 'lucide-react';
import { MicState } from '@/lib/types';

interface MicButtonProps {
  state: MicState;
}

const WaveformBars = () => (
  <div className="flex items-center gap-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="w-1 rounded-full bg-destructive-foreground"
        animate={{ height: [8, 28, 8] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

export function MicButton({ state }: MicButtonProps) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isDone = state === 'done';

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className={`relative flex h-[120px] w-[120px] items-center justify-center rounded-full transition-colors duration-300 ${
          isRecording ? 'bg-destructive animate-mic-recording' : isDone ? 'bg-success' : 'bg-primary animate-mic-pulse'
        }`}
        whileTap={{ scale: 0.95 }}
        animate={isDone ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div key="loader" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <Loader2 className="h-10 w-10 animate-spin text-primary-foreground" />
            </motion.div>
          ) : isDone ? (
            <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <Check className="h-10 w-10 text-success-foreground" />
            </motion.div>
          ) : isRecording ? (
            <motion.div key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WaveformBars />
            </motion.div>
          ) : (
            <motion.div key="mic" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <Mic className="h-10 w-10 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.p
        className="text-sm text-muted-foreground"
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {state === 'idle' && 'Hold to speak'}
        {state === 'recording' && 'Listening...'}
        {state === 'processing' && 'Thinking...'}
        {state === 'done' && 'Done!'}
      </motion.p>
    </div>
  );
}
