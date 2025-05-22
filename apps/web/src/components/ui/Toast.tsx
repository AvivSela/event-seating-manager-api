import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

const toastTypeConfig = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-success-50 text-success-900 border-success-200',
    iconClassName: 'text-success-500',
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-danger-50 text-danger-900 border-danger-200',
    iconClassName: 'text-danger-500',
  },
  warning: {
    icon: ExclamationCircleIcon,
    className: 'bg-warning-50 text-warning-900 border-warning-200',
    iconClassName: 'text-warning-500',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-info-50 text-info-900 border-info-200',
    iconClassName: 'text-info-500',
  },
};

export function Toast({ id, message, type, duration, onDismiss }: ToastProps) {
  const { icon: Icon, className, iconClassName } = toastTypeConfig[type];

  React.useEffect(() => {
    if (duration === undefined) return;
    
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between gap-4',
        'rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right duration-300',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 shrink-0', iconClassName)} />
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className={cn(
          'shrink-0 rounded-md p-1 transition-colors',
          'hover:bg-black/5 focus:bg-black/5',
          'focus:outline-none focus:ring-2 focus:ring-black/10'
        )}
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed right-0 top-4 z-50',
        'flex max-h-screen w-full flex-col items-end gap-2 px-4',
        'sm:max-w-sm'
      )}
    >
      {children}
    </div>,
    document.body
  );
} 