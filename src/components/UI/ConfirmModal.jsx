import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, confirmText = 'Confirm', confirmVariant = 'danger', onConfirm, onClose }) => {
  if (!isOpen) return null;

  const buttonVariants = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
    primary: 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${buttonVariants[confirmVariant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
