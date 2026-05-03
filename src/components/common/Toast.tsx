import {motion, AnimatePresence} from 'motion/react';
import {CheckCircle, XCircle, AlertTriangle, Info, X} from 'lucide-react';
import {cn} from '@/utils/helpers';
import {useToast, type ToastMessage, type ToastType} from './ToastContext';

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
  error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
  warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
  info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
};

const progressBarStyles: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({toast, onDismiss}: ToastItemProps) {
  const {id, type, title, message, action} = toast;

  return (
    <motion.div
      layout
      initial={{opacity: 0, y: 50, scale: 0.9}}
      animate={{opacity: 1, y: 0, scale: 1}}
      exit={{opacity: 0, x: 100, scale: 0.9}}
      transition={{type: 'spring', stiffness: 500, damping: 30}}
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg',
        'bg-white dark:bg-stone-900',
        toastStyles[type]
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{toastIcons[type]}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</h4>
            {message && (
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{message}</p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
              >
                {action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => onDismiss(id)}
            className="flex-shrink-0 rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {toast.duration && toast.duration > 0 && (
        <div className="h-1 w-full overflow-hidden bg-stone-200 dark:bg-stone-700">
          <motion.div
            initial={{scaleX: 1}}
            animate={{scaleX: 0}}
            transition={{duration: toast.duration / 1000, ease: 'linear'}}
            className={cn('h-full origin-left', progressBarStyles[type])}
          />
        </div>
      )}
    </motion.div>
  );
}

function ToastContainer() {
  const {toasts, removeToast} = useToast();

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end gap-2 p-4 sm:items-start sm:justify-start"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export {ToastContainer, ToastItem};
export type {ToastItemProps};
