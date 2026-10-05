import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export const SalesTrendChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        No sales data available for graph rendering.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#92400e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#92400e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [formatCurrency(value), 'Sales']}
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          />
          <Area type="monotone" dataKey="amount" stroke="#92400e" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
