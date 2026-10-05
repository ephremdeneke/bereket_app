import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export const CashBankChart = ({ cashAmount = 0, bankAmount = 0 }) => {
  const data = [
    { name: 'Cash Sales', value: Number(cashAmount) || 0, color: '#0d9488' },
    { name: 'Bank Sales', value: Number(bankAmount) || 0, color: '#4f46e5' }
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        No payment breakdown available.
      </div>
    );
  }

  return (
    <div className="w-full h-64 flex flex-col justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(value), 'Received']}
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
