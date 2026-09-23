import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircleIcon, CheckIcon, InfoIcon, XIcon } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

const icons = {
  success: CheckIcon,
  info: InfoIcon,
  error: AlertCircleIcon
};

export function ToastStack() {
  const { toasts, dismissToast } = useStore();

  return (
    <div
      className="pointer-events-none fixed bottom-20 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0"
      role="status"
      aria-live="polite">
      
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="pointer-events-auto flex items-start gap-3 border border-gold/30 bg-ink px-4 py-3 text-cream shadow-panel">
              
              <Icon
                width={16}
                height={16}
                className={toast.tone === 'error' ? 'mt-0.5 text-red-300' : 'mt-0.5 text-gold'} />
              
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.body && <p className="mt-0.5 truncate text-xs text-cream/60">{toast.body}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-cream/50 transition-colors duration-150 hover:text-cream">
                
                <XIcon width={14} height={14} />
              </button>
            </motion.div>);

        })}
      </AnimatePresence>
    </div>);

}