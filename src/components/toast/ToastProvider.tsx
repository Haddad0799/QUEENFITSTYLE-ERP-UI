import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckIcon } from '../icons';

export type ToastVariant = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100',
  error:
    'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100',
  info:
    'border-edge bg-surface text-heading dark:bg-surface',
};

const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
  success: <CheckIcon className="h-3 w-3" />,
  error: '!',
  info: 'i',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seqRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<ToastContextValue['push']>((toast) => {
    const id = ++seqRef.current;
    setToasts((all) => [...all, { ...toast, id }]);
    window.setTimeout(() => remove(id), 4000);
  }, [remove]);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) =>
        push({ variant: 'success', title, description }),
      error: (title, description) =>
        push({ variant: 'error', title, description }),
      info: (title, description) =>
        push({ variant: 'info', title, description }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-3.5 py-3 text-xs shadow-lg shadow-black/5 transition-all duration-200 ${
        VARIANT_STYLES[toast.variant]
      } ${entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
      role="status"
    >
      <span
        className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
          toast.variant === 'success'
            ? 'bg-emerald-500 text-white'
            : toast.variant === 'error'
              ? 'bg-rose-500 text-white'
              : 'bg-brand text-on-brand'
        }`}
      >
        {VARIANT_ICON[toast.variant]}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold leading-tight">
          {toast.title}
        </span>
        {toast.description && (
          <span className="mt-0.5 text-[11px] leading-snug opacity-80">
            {toast.description}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar notificação"
        className="ml-1 text-[14px] leading-none opacity-60 transition hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast precisa estar dentro de <ToastProvider />');
  }
  return ctx;
}
