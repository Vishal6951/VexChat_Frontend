import { X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

const iconMap = {
  error: <AlertCircle size={16} className="text-red-400 shrink-0" />,
  info: <Info size={16} className="text-purple-400 shrink-0" />,
  success: <CheckCircle size={16} className="text-green-400 shrink-0" />,
};

const borderMap = {
  error: 'border-red-500/30',
  info: 'border-purple-500/30',
  success: 'border-green-500/30',
};

/**
 * ToastContainer — renders all active toasts in the bottom-right corner.
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            toast-enter pointer-events-auto
            flex items-start gap-3 px-4 py-3 rounded-xl
            glass border ${borderMap[toast.type] || borderMap.info}
            shadow-lg
          `}
        >
          {iconMap[toast.type] || iconMap.info}
          <p className="flex-1 text-sm text-gray-300">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-gray-600 hover:text-gray-400 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
