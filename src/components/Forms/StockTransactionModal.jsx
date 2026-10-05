import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, X } from 'lucide-react';
import { getTodayFormatted } from '../../utils/formatters';

export const StockTransactionModal = ({ isOpen, item, onSave, onClose }) => {
  const [transactionType, setTransactionType] = useState('Stock In');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayFormatted());

  useEffect(() => {
    setTransactionType('Stock In');
    setQuantity('');
    setDescription('');
    setDate(getTodayFormatted());
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      itemId: item.id,
      itemName: item.name,
      transactionType,
      quantity: Number(quantity) || 0,
      unitCost: item.purchaseCost,
      description: description.trim(),
      date
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Record Stock Movement</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{item.name} (Current: {item.currentQuantity} {item.unit})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('Stock In')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  transactionType === 'Stock In'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 mb-1 text-emerald-600" />
                Stock In (+)
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('Stock Out')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  transactionType === 'Stock Out'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 mb-1 text-rose-600" />
                Stock Out (-)
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('Adjustment')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  transactionType === 'Adjustment'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="w-4 h-4 mb-1 text-sky-600" />
                Adjustment (=)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity ({transactionType === 'Adjustment' ? `Set Total Qty (${item.unit})` : `Qty (${item.unit})`})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder={transactionType === 'Adjustment' ? 'e.g. 10 (Direct current qty)' : 'e.g. 5'}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notes / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Purchase order delivery from supplier"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2 text-sm font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-xs transition-colors"
            >
              Save Stock Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
