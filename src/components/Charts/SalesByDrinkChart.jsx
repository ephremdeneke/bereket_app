import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { formatNumber } from '../../utils/formatters';

const COLORS = ['#92400e', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];

export const SalesByDrinkChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        No drink sales data recorded.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [formatNumber(value) + ' Cups', 'Quantity Sold']}
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="quantity" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
