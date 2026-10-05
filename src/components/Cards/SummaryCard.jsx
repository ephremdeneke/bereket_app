import React from 'react';

export const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'amber',
  onClick,
  badge
}) => {
  const colorThemes = {
    amber: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-amber-50 text-amber-800',
      accent: 'text-amber-800'
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-emerald-50 text-emerald-700',
      accent: 'text-emerald-700'
    },
    teal: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-teal-50 text-teal-700',
      accent: 'text-teal-700'
    },
    indigo: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-indigo-50 text-indigo-700',
      accent: 'text-indigo-700'
    },
    rose: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-rose-50 text-rose-700',
      accent: 'text-rose-700'
    },
    sky: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-sky-50 text-sky-700',
      accent: 'text-sky-700'
    }
  };

  const theme = colorThemes[color] || colorThemes.amber;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border ${theme.border} ${theme.bg} shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${theme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {badge}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
