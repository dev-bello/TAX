import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const iconMap = {
    success: <CheckCircle size={18} className="text-[#1b5e20]" />,
    error: <AlertTriangle size={18} className="text-[#c62828]" />,
    warning: <AlertTriangle size={18} className="text-[#e65100]" />,
    info: <Info size={18} className="text-[#1565c0]" />,
  };

  const bgMap = {
    success: 'bg-[#e8f5e9] border-l-4 border-l-[#2e7d32] border-y border-r border-[#c8e6c9]',
    error: 'bg-[#ffebee] border-l-4 border-l-[#c62828] border-y border-r border-[#ef9a9a]',
    warning: 'bg-[#fff3e0] border-l-4 border-l-[#ef6c00] border-y border-r border-[#ffcc80]',
    info: 'bg-[#e3f2fd] border-l-4 border-l-[#1565c0] border-y border-r border-[#90caf9]',
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[10001] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right fade-in duration-300 ${bgMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <p className="text-sm font-medium text-on-surface">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-outline hover:text-on-surface transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
