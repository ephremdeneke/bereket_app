import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Trash2, Edit, Wallet, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { SummaryCard } from '../components/Cards/SummaryCard';
import { Badge } from '../components/UI/Badge';
import { ExpenseModal } from '../components/Forms/ExpenseModal';
import { ConfirmModal } from '../components/UI/ConfirmModal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { api } from '../services/api';

export const Expenses = ({ showToast }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses();
      setExpenses(data || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to fetch expense records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, expenseData);
        showToast({ type: 'success', message: 'Expense record updated successfully.' });
      } else {
        await api.addExpense(expenseData);
        showToast({ type: 'success', message: 'Expense recorded successfully.' });
      }
      loadExpenses();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to save expense record.' });
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteExpense(deleteTarget.id);
      showToast({ type: 'info', message: 'Expense record deleted.' });
      loadExpenses();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to delete expense.' });
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading expense records..." />;
  }

  const categories = [
    'Rent', 'Electricity', 'Water', 'Salary', 'Ingredients',
    'Transportation', 'Maintenance', 'Cleaning', 'Supplies', 'Other'
  ];

  const filteredExpenses = expenses.filter(e => {
    if (!e) return false;
    const searchLower = (searchTerm || '').toLowerCase();
    const descLower = String(e.description || '').toLowerCase();
    const idLower = String(e.id || '').toLowerCase();
    const matchesSearch = descLower.includes(searchLower) || idLower.includes(searchLower);
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesMethod = methodFilter === 'All' || e.paymentMethod === methodFilter;
    const matchesDate = !dateFilter || e.date === dateFilter;

    return matchesSearch && matchesCategory && matchesMethod && matchesDate;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Summary Metrics
  const totalExpenseVal = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const cashExpenseVal = filteredExpenses.filter(e => e.paymentMethod === 'Cash').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const bankExpenseVal = filteredExpenses.filter(e => e.paymentMethod === 'Bank').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Expense Management</h2>
            <p className="text-xs text-slate-500 font-medium">
              Record daily cafe operating expenses (Rent, Electricity, Salary, Ingredients, Supplies).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(totalExpenseVal)}
          subtitle={`${filteredExpenses.length} expense entries`}
          icon={Receipt}
          color="rose"
        />

        <SummaryCard
          title="Cash Paid Expenses"
          value={formatCurrency(cashExpenseVal)}
          subtitle="Out of register cash"
          icon={Wallet}
          color="teal"
        />

        <SummaryCard
          title="Bank Paid Expenses"
          value={formatCurrency(bankExpenseVal)}
          subtitle="Electronic transfer / Cheque"
          icon={DollarSign}
          color="indigo"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search description or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Payment:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash Only</option>
              <option value="Bank">Bank Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-xs text-rose-600 underline font-semibold">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title="No expense records found"
          description="Try adjusting your filters or record a new expense."
          actionLabel="Record Expense"
          onAction={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Expense ID</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5 text-center">Payment Method</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-slate-500">
                      {exp.id}
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-900">
                      {formatDate(exp.date)}
                    </td>

                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-700 font-medium max-w-xs truncate">
                      {exp.description}
                    </td>

                    <td className="py-4 px-5 text-right font-extrabold text-rose-800 text-base">
                      {formatCurrency(exp.amount)}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <Badge variant={exp.paymentMethod === 'Cash' ? 'cash' : 'bank'}>
                        {exp.paymentMethod}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                          title="Edit Expense"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        expense={editingExpense}
        onSave={handleSaveExpense}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Expense Record"
        message={`Are you sure you want to delete expense record "${deleteTarget?.description}" (${formatCurrency(deleteTarget?.amount)})? This action cannot be undone.`}
        confirmText="Delete Expense"
        confirmVariant="danger"
        onConfirm={handleDeleteExpense}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
