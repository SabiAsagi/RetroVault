"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 pointer-events-none p-4">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="pointer-events-auto flex items-center gap-3 bg-vault-surface border border-vault-border rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] p-5 pr-14 min-w-[320px] max-w-[90vw] relative animate-in zoom-in-95 fade-in duration-300"
          >
            {toast.type === 'success' && <CheckCircle size={20} className="text-mint shrink-0" />}
            {toast.type === 'error' && <AlertTriangle size={20} className="text-coral shrink-0" />}
            {toast.type === 'info' && <Info size={20} className="text-neon-blue shrink-0" />}
            
            <p className="text-sm font-bold text-text-primary">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
