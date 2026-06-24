import React from 'react';
import { useRestOS } from '../context/RestOSContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts } = useRestOS();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border text-white transition-all duration-300 transform translate-y-0 animate-fade-in ${
            toast.type === 'success'
              ? 'bg-green-600 border-green-500 shadow-green-900/10'
              : toast.type === 'warning'
              ? 'bg-amber-600 border-amber-500 shadow-amber-900/10'
              : toast.type === 'error'
              ? 'bg-red-600 border-red-500 shadow-red-900/10'
              : 'bg-blue-600 border-blue-500 shadow-blue-900/10'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'warning' && <AlertCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          <div className="flex-1 text-sm font-semibold tracking-wide">
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
