import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Trash2, ShieldAlert, Check } from 'lucide-react';

const DATA_SHEETS = [
  'Products',
  'DailySales',
  'DailySalesItems',
  'Inventory',
  'InventoryTransactions',
  'Expenses',
  'Suppliers'
];

export const ClearDataModal = ({ isOpen, summary = [], onConfirm, onClose }) => {
  const [selected, setSelected] = useState([]);
  const [includeUsers, setIncludeUsers] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(DATA_SHEETS);
      setIncludeUsers(false);
      setConfirmText('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rowCount = (name) => {
    const entry = summary.find(s => s.sheet === name);
    return entry ? entry.rows : 0;
  };

  const toggleSheet = (name) => {
    setSelected(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  };

  const totalRows = selected.reduce((acc, name) => acc + rowCount(name), 0) + (includeUsers ? rowCount('Users') : 0);

  const canConfirm = confirmText.trim().toUpperCase() === 'CLEAR' && selected.length > 0 && !loading;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm({ sheets: selected, includeUsers });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Clear Data from Sheet</h3>
              <p className="text-xs text-slate-500 font-medium">Select the sheets you want to wipe</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            This permanently deletes every record in the selected sheets (header rows are kept). It cannot be undone.
          </span>
        </div>

        <div className="mt-4 space-y-1.5">
          {DATA_SHEETS.map(name => (
            <label
              key={name}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(name)}
                  onChange={() => toggleSheet(name)}
                  className="w-4 h-4 accent-rose-600"
                />
                <span className="text-sm font-semibold text-slate-800">{name}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                {rowCount(name)} rows
              </span>
            </label>
          ))}

          <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeUsers}
                onChange={(e) => setIncludeUsers(e.target.checked)}
                className="w-4 h-4 accent-rose-600"
              />
              <div>
                <span className="text-sm font-semibold text-rose-900">Users</span>
                <p className="text-[11px] text-rose-700/80">Also removes logins (the default admin is restored automatically)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
              {rowCount('Users')} rows
            </span>
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Type <span className="text-rose-600">CLEAR</span> to confirm ({totalRows} rows will be deleted)
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="CLEAR"
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {loading ? <AlertTriangle className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
            <span>{loading ? 'Clearing...' : 'Clear Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
