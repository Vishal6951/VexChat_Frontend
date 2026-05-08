import { createContext, useContext, useState, useCallback } from 'react';

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {'error'|'info'|'success'} type
 * @property {string} message
 */

const ToastContext = createContext(null);

/**
 * ToastProvider — manages a list of transient toast notifications.
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto-dismiss after 4 s
    setTimeout(() => removeToast(id), 4000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/** @returns {{ toasts: Toast[], addToast: Function, removeToast: Function }} */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
