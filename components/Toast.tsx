'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (title: string, options?: { message?: string; type?: ToastType; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((
    title: string,
    options?: { message?: string; type?: ToastType; duration?: number }
  ) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const type = options?.type || 'success';
    const duration = options?.duration || 3500;

    const newToast: Toast = {
      id,
      type,
      title,
      message: options?.message
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast(title, { message, type: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast(title, { message, type: 'error', duration: 5000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast(title, { message, type: 'info' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 transition-all ${
                isSuccess
                  ? 'bg-white/95 text-slate-900 border-emerald-200 shadow-emerald-900/5'
                  : isError
                  ? 'bg-white/95 text-slate-900 border-rose-200 shadow-rose-900/5'
                  : 'bg-white/95 text-slate-900 border-slate-200 shadow-slate-900/5'
              }`}
            >
              <div className="flex-shrink-0 pt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                {t.message && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.message}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
