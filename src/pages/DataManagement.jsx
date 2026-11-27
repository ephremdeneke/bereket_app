import React, { useEffect, useState } from 'react';
import { Database, Trash2, RefreshCw, AlertTriangle, Table2, ShieldAlert, HardDriveDownload } from 'lucide-react';
import { api } from '../services/api';
import { ClearDataModal } from '../components/Forms/ClearDataModal';
import { ConfirmModal } from '../components/UI/ConfirmModal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

const SHEET_LABELS = {
  Products: 'Drink products & pricing',
  DailySales: 'Daily sales records',
  DailySalesItems: 'Daily sales line items',
  Inventory: 'Stock & ingredients',
  InventoryTransactions: 'Stock movements',
  Expenses: 'Operating expenses',
  Suppliers: 'Suppliers',
  Users: 'User accounts & logins',
  Settings: 'App settings'
};

export const DataManagement = ({ showToast }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [sheetTarget, setSheetTarget] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await api.getDataSummary();
      setSummary(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to load sheet data summary.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleClearSheet = async () => {
    if (!sheetTarget) return;
    try {
      const result = await api.clearSheetData({ sheet: sheetTarget.sheet });
      const removed = result?.rowsDeleted || 0;
      showToast({
        type: 'success',
        message: `Cleared ${sheetTarget.sheet} (${removed} row${removed === 1 ? '' : 's'} deleted).`
      });
      loadSummary();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: err.message || 'Failed to clear sheet data.' });
    }
  };

  const handleClearSelected = async ({ sheets, includeUsers }) => {
    try {
      const result = await api.clearAllData({ sheets, includeUsers });
      const removed = (result?.cleared || []).reduce((acc, c) => acc + (Number(c.rowsDeleted) || 0), 0);
      showToast({
        type: 'success',
        message: `Cleared ${sheets.length} sheet${sheets.length === 1 ? '' : 's'} - ${removed} row${removed === 1 ? '' : 's'} deleted.`
      });
      setShowClearModal(false);
      loadSummary();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: err.message || 'Failed to clear data.' });
    }
  };

  const totalRows = summary.reduce((acc, s) => acc + (Number(s.rows) || 0), 0);

  if (loading) {
    return <LoadingSpinner label="Loading sheet data summary..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Data Management</h2>
            <p className="text-xs text-slate-500 font-medium">
              Inspect what is stored in your Google Sheet and wipe records when you start a new period.
            </p>
          </div>
        </div>

        <button
          onClick={loadSummary}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary stat */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <HardDriveDownload className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-300 font-bold">Total stored records</p>
            <p className="text-3xl font-extrabold text-white">{totalRows}</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 text-right max-w-xs hidden sm:block">
          Header rows are never removed, so the sheet structure stays intact after a clear.
        </p>
      </div>

      {/* Sheets list */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Table2 className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Sheets in your database</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {summary.map(entry => (
            <div key={entry.sheet} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                  <Table2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{entry.sheet}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {entry.exists ? (SHEET_LABELS[entry.sheet] || 'Managed sheet') : 'Sheet not created yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  entry.rows > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {entry.rows} rows
                </span>

                <button
                  onClick={() => setSheetTarget(entry)}
                  disabled={!entry.exists || entry.rows === 0}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  title={`Clear ${entry.sheet}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/60 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-900">Danger Zone</h3>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Clear all data from sheet</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
              Wipes every business record (products, sales, inventory, expenses, suppliers) from the Google Sheet.
              Use this when you want to start a fresh accounting period. Header rows are kept.
            </p>
          </div>

          <button
            onClick={() => setShowClearModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Clear all data modal */}
      <ClearDataModal
        isOpen={showClearModal}
        summary={summary}
        onConfirm={handleClearSelected}
        onClose={() => setShowClearModal(false)}
      />

      {/* Single sheet confirmation */}
      <ConfirmModal
        isOpen={Boolean(sheetTarget)}
        title={`Clear ${sheetTarget?.sheet || 'sheet'}`}
        message={`All ${sheetTarget?.rows || 0} row(s) in "${sheetTarget?.sheet}" will be permanently deleted. The header row is kept. This action cannot be undone.`}
        confirmText="Clear Sheet"
        confirmVariant="danger"
        onConfirm={handleClearSheet}
        onClose={() => setSheetTarget(null)}
      />
    </div>
  );
};
