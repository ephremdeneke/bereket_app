import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Calendar, Eye, Edit, CheckCircle2, AlertTriangle, X, FileSpreadsheet } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/UI/Badge';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { api } from '../services/api';

export const SalesHistory = ({ showToast }) => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedReport, setSelectedReport] = useState(null);

  const loadSalesHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getDailySales();
      setSales(data || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to load sales history.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesHistory();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Retrieving sales records history..." />;
  }

  // Filter sales safely
  const filteredSales = sales.filter(report => {
    if (!report) return false;
    const searchLower = (searchTerm || '').toLowerCase();
    const dateStr = String(report.date || '');
    const notesLower = String(report.notes || '').toLowerCase();
    const matchesSearch = dateStr.includes(searchTerm) || notesLower.includes(searchLower);

    const matchesStatus = statusFilter === 'All' || report.reconciliationStatus === statusFilter;
    const matchesDate = !dateFilter || report.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sales History & Audit Logs</h2>
            <p className="text-xs text-slate-500 font-medium">
              Complete archive of manager daily sales recordings and reconciliation balances.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/daily-sales')}
          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          + Record New Sales
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by notes or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Matched">Matched Only</option>
              <option value="Mismatch">Mismatch Only</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-rose-600 hover:text-rose-800 underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sales Records Table */}
      {filteredSales.length === 0 ? (
        <EmptyState
          title="No daily sales reports found"
          description="Try adjusting your date filters or search terms."
          actionLabel="Record Daily Sales Now"
          onAction={() => navigate('/daily-sales')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Calculated Sales</th>
                  <th className="py-3.5 px-5 text-right">Cash Received</th>
                  <th className="py-3.5 px-5 text-right">Bank Received</th>
                  <th className="py-3.5 px-5 text-right">Difference</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((report) => (
                  <tr key={report.id || report.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {formatDate(report.date)}
                      {report.notes && (
                        <p className="text-xs font-normal text-slate-500 truncate max-w-xs mt-0.5">
                          {report.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right font-extrabold text-amber-900">
                      {formatCurrency(report.calculatedSales)}
                    </td>

                    <td className="py-4 px-5 text-right font-semibold text-teal-800">
                      {formatCurrency(report.cashSales)}
                    </td>

                    <td className="py-4 px-5 text-right font-semibold text-indigo-800">
                      {formatCurrency(report.bankSales)}
                    </td>

                    <td className={`py-4 px-5 text-right font-extrabold ${
                      report.difference === 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {formatCurrency(report.difference)}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <Badge variant={report.reconciliationStatus === 'Matched' ? 'matched' : 'mismatch'}>
                        {report.reconciliationStatus}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                          title="View Itemized Breakdown"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Itemized Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Daily Sales Report ({formatDate(selectedReport.date)})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">ID: {selectedReport.salesId || selectedReport.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reconciliation status summary */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Calculated Sales</span>
                <span className="font-extrabold text-amber-900 text-base">{formatCurrency(selectedReport.calculatedSales)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Cash Sales</span>
                <span className="font-bold text-teal-800">{formatCurrency(selectedReport.cashSales)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Bank Sales</span>
                <span className="font-bold text-indigo-800">{formatCurrency(selectedReport.bankSales)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Status</span>
                <Badge variant={selectedReport.reconciliationStatus === 'Matched' ? 'matched' : 'mismatch'}>
                  {selectedReport.reconciliationStatus} ({formatCurrency(selectedReport.difference)})
                </Badge>
              </div>
            </div>

            {/* Drink Item Breakdown Table */}
            <div className="mt-5">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Drink Breakdown Quantities</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Drink Product</th>
                      <th className="py-2.5 px-4 text-center">Qty Sold</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">Calculated Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReport.items && selectedReport.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{item.productName}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-amber-900">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-amber-950">{formatCurrency(item.calculatedAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedReport.notes && (
              <div className="mt-4 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-slate-700">
                <span className="font-bold text-amber-900 block mb-0.5">Shift Notes:</span>
                {selectedReport.notes}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
