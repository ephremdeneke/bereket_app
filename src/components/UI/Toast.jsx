import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type = 'info', message } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-sky-50 border-sky-200 text-sky-900'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short transition-all duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-md ${bgStyles[type] || bgStyles.info}`}>
        {icons[type] || icons.info}
        <p className="text-sm font-medium pr-2">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-auto text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
