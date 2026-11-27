import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    matched: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 border border-emerald-200 dark:border-emerald-700/50',
    mismatch: 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 border border-rose-200 dark:border-rose-700/50',
    lowStock: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 border border-amber-300 font-semibold animate-pulse',
    active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 border border-emerald-200 dark:border-emerald-700/50',
    inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
    cash: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 border border-teal-200 dark:border-teal-700/50',
    bank: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    primary: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 border border-amber-200 dark:border-amber-700/50'
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};
