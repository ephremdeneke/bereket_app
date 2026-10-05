import React, { useState, useEffect } from 'react';
import { Receipt, X } from 'lucide-react';
import { getTodayFormatted } from '../../utils/formatters';

export const ExpenseModal = ({ isOpen, expense, onSave, onClose }) => {
  const [date, setDate] = useState(getTodayFormatted());
  const [category, setCategory] = useState('Ingredients');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const categories = [
    'Rent',
    'Electricity',
    'Water',
    'Salary',
    'Ingredients',
    'Transportation',
    'Maintenance',
    'Cleaning',
    'Supplies',
    'Other'
  ];

  useEffect(() => {
    if (expense) {
      setDate(expense.date || getTodayFormatted());
      setCategory(expense.category || 'Ingredients');
      setDescription(expense.description || '');
      setAmount(expense.amount || '');
      setPaymentMethod(expense.paymentMethod || 'Cash');
    } else {
      setDate(getTodayFormatted());
      setCategory('Ingredients');
      setDescription('');
      setAmount('');
      setPaymentMethod('Cash');
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      date,
      category,
      description: description.trim(),
      amount: Number(amount) || 0,
      paymentMethod
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {expense ? 'Edit Expense Record' : 'Record New Expense'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Expense Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Expense Amount (ETB)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                paymentMethod === 'Cash'
                  ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  checked={paymentMethod === 'Cash'}
                  onChange={() => setPaymentMethod('Cash')}
                  className="hidden"
                />
                Cash Payment
              </label>

              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                paymentMethod === 'Bank'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Bank"
                  checked={paymentMethod === 'Bank'}
                  onChange={() => setPaymentMethod('Bank')}
                  className="hidden"
                />
                Bank / Transfer
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description / Memo
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Purchased 5kg Coffee Beans from supplier"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-xs transition-colors"
            >
              {expense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
