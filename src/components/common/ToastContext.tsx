import {createContext, useContext, useState, useCallback, type ReactNode} from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string | undefined;
  duration?: number | undefined;
  action?:
    | {
        label: string;
        onClick: () => void;
      }
    | undefined;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  success: (title: string, message?: string, options?: Partial<ToastMessage>) => string;
  error: (title: string, message?: string, options?: Partial<ToastMessage>) => string;
  warning: (title: string, message?: string, options?: Partial<ToastMessage>) => string;
  info: (title: string, message?: string, options?: Partial<ToastMessage>) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number | undefined;
}

function ToastProvider({children, maxToasts = 5}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>): string => {
      const id = generateId();
      const newToast: ToastMessage = {...toast, id};

      setToasts(prev => {
        const updated = [...prev, newToast];
        return updated.slice(-(maxToasts ?? 5));
      });

      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [maxToasts, removeToast]
  );

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (title: string, message?: string, options?: Partial<ToastMessage>): string => {
      return addToast({type: 'success', title, message: message ?? undefined, ...options});
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<ToastMessage>): string => {
      return addToast({
        type: 'error',
        title,
        message: message ?? undefined,
        duration: 7000,
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<ToastMessage>): string => {
      return addToast({type: 'warning', title, message: message ?? undefined, ...options});
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<ToastMessage>): string => {
      return addToast({type: 'info', title, message: message ?? undefined, ...options});
    },
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export {ToastProvider, useToast};
export type {ToastMessage, ToastType, ToastContextValue};
