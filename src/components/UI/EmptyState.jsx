import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no items matching your criteria yet.',
  actionLabel,
  onAction,
  icon: Icon = PackageOpen
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
      <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl mb-4 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-sm font-semibold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-xs transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
