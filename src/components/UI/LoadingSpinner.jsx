import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading data...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-amber-700 animate-spin mb-3`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};
