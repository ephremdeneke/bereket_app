import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    matched: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    mismatch: 'bg-rose-100 text-rose-800 border border-rose-200',
    lowStock: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold animate-pulse',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border border-slate-200',
    cash: 'bg-teal-50 text-teal-700 border border-teal-200',
    bank: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-amber-100 text-amber-800 border border-amber-200'
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};
