import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Receipt, DollarSign, Wallet, Coffee, PieChart, Printer, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { SummaryCard } from '../components/Cards/SummaryCard';
import { Badge } from '../components/UI/Badge';
import { SalesTrendChart } from '../components/Charts/SalesTrendChart';
import { ExpenseTrendChart } from '../components/Charts/ExpenseTrendChart';
import { CashBankChart } from '../components/Charts/CashBankChart';
import { SalesByDrinkChart } from '../components/Charts/SalesByDrinkChart';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { api } from '../services/api';

export const Reports = ({ showToast }) => {
  const [timeframe, setTimeframe] = useState('This Month'); // Today, This Week, This Month, All Time
  const [loading, setLoading] = useState(true);

  const [dailySales, setDailySales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, eData, pData] = await Promise.all([
        api.getDailySales(),
        api.getExpenses(),
        api.getProducts()
      ]);
      setDailySales(sData || []);
      setExpenses(eData || []);
      setProducts(pData || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to generate reports data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Generating manager financial analysis..." />;
  }

  // Filter by timeframe
  const getFilteredSales = () => {
    const now = new Date();
    if (timeframe === 'Today') {
      const todayStr = now.toISOString().slice(0, 10);
      return dailySales.filter(s => s.date === todayStr);
    } else if (timeframe === 'This Week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return dailySales.filter(s => new Date(s.date) >= weekAgo);
    } else if (timeframe === 'This Month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return dailySales.filter(s => new Date(s.date) >= monthAgo);
    }
    return dailySales;
  };

  const getFilteredExpenses = () => {
    const now = new Date();
    if (timeframe === 'Today') {
      const todayStr = now.toISOString().slice(0, 10);
      return expenses.filter(e => e.date === todayStr);
    } else if (timeframe === 'This Week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return expenses.filter(e => new Date(e.date) >= weekAgo);
    } else if (timeframe === 'This Month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return expenses.filter(e => new Date(e.date) >= monthAgo);
    }
    return expenses;
  };

  const filteredSales = getFilteredSales();
  const filteredExpenses = getFilteredExpenses();

  // Metrics
  const totalSales = filteredSales.reduce((acc, curr) => acc + (Number(curr.calculatedSales) || 0), 0);
  const cashSales = filteredSales.reduce((acc, curr) => acc + (Number(curr.cashSales) || 0), 0);
  const bankSales = filteredSales.reduce((acc, curr) => acc + (Number(curr.bankSales) || 0), 0);

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const cashExpenses = filteredExpenses.filter(e => e.paymentMethod === 'Cash').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const bankExpenses = filteredExpenses.filter(e => e.paymentMethod === 'Bank').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const netIncome = totalSales - totalExpenses;
  const profitMarginPercent = totalSales > 0 ? ((netIncome / totalSales) * 100).toFixed(1) : 0;

  // Drink sales volume breakdown
  const drinkMap = {};
  filteredSales.forEach(sale => {
    if (sale.items) {
      sale.items.forEach(item => {
        if (!drinkMap[item.productName]) {
          drinkMap[item.productName] = { quantity: 0, revenue: 0 };
        }
        drinkMap[item.productName].quantity += Number(item.quantity) || 0;
        drinkMap[item.productName].revenue += Number(item.calculatedAmount) || 0;
      });
    }
  });

  const drinkRankingList = Object.keys(drinkMap).map(name => ({
    name,
    quantity: drinkMap[name].quantity,
    revenue: drinkMap[name].revenue
  })).sort((a, b) => b.revenue - a.revenue);

  // Expense categories breakdown
  const expenseCatMap = {};
  filteredExpenses.forEach(exp => {
    expenseCatMap[exp.category] = (expenseCatMap[exp.category] || 0) + (Number(exp.amount) || 0);
  });

  const expenseCategoryList = Object.keys(expenseCatMap).map(cat => ({
    category: cat,
    amount: expenseCatMap[cat],
    percentage: totalExpenses > 0 ? ((expenseCatMap[cat] / totalExpenses) * 100).toFixed(1) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Reconciliation Audit
  const matchedDaysCount = filteredSales.filter(s => s.reconciliationStatus === 'Matched').length;
  const mismatchDaysCount = filteredSales.filter(s => s.reconciliationStatus === 'Mismatch').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Business Analysis & P&L Reports</h2>
            <p className="text-xs text-slate-500 font-medium">
              Comprehensive financial breakdown, profitability analysis, and drink sales performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {['Today', 'This Week', 'This Month', 'All Time'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="Print Report Summary"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Profit & Loss (P&L) Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Gross Sales"
          value={formatCurrency(totalSales)}
          subtitle={`${filteredSales.length} daily reports`}
          icon={TrendingUp}
          color="amber"
        />

        <SummaryCard
          title="Total Operating Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle={`${filteredExpenses.length} expense vouchers`}
          icon={Receipt}
          color="rose"
        />

        <SummaryCard
          title="Net Business Income"
          value={formatCurrency(netIncome)}
          subtitle="Net Profit after expenses"
          icon={TrendingUp}
          color={netIncome >= 0 ? 'emerald' : 'rose'}
          badge={<Badge variant={netIncome >= 0 ? 'matched' : 'mismatch'}>{netIncome >= 0 ? 'Profit' : 'Loss'}</Badge>}
        />

        <SummaryCard
          title="Profit Margin %"
          value={`${profitMarginPercent}%`}
          subtitle="Net Income ÷ Total Sales"
          icon={PieChart}
          color="sky"
        />
      </div>

      {/* Cash vs Bank Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Channels */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-teal-700" />
            Sales Receipts Payment Channels
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
              <span className="text-xs font-bold text-teal-900 block">Cash Register Collections</span>
              <span className="text-xl font-extrabold text-teal-950 mt-1 block">{formatCurrency(cashSales)}</span>
              <span className="text-xs text-teal-700 font-medium mt-0.5 block">
                {totalSales > 0 ? ((cashSales / totalSales) * 100).toFixed(1) : 0}% of Total Sales
              </span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
              <span className="text-xs font-bold text-indigo-900 block">Bank & Telebirr Transfers</span>
              <span className="text-xl font-extrabold text-indigo-950 mt-1 block">{formatCurrency(bankSales)}</span>
              <span className="text-xs text-indigo-700 font-medium mt-0.5 block">
                {totalSales > 0 ? ((bankSales / totalSales) * 100).toFixed(1) : 0}% of Total Sales
              </span>
            </div>
          </div>
        </div>

        {/* Expense Channels */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-700" />
            Expense Payment Outflows
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="text-xs font-bold text-rose-900 block">Cash Register Expenses</span>
              <span className="text-xl font-extrabold text-rose-950 mt-1 block">{formatCurrency(cashExpenses)}</span>
              <span className="text-xs text-rose-700 font-medium mt-0.5 block">
                {totalExpenses > 0 ? ((cashExpenses / totalExpenses) * 100).toFixed(1) : 0}% of Expenses
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800 block">Bank Account Expenses</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{formatCurrency(bankExpenses)}</span>
              <span className="text-xs text-slate-600 font-medium mt-0.5 block">
                {totalExpenses > 0 ? ((bankExpenses / totalExpenses) * 100).toFixed(1) : 0}% of Expenses
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drink Performance & Expense Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drink Sales Performance Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-800" />
              Drink Sales Volume & Revenue Ranking
            </h3>
            <p className="text-xs text-slate-500">Ranked by total calculated revenue ({timeframe})</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase">
                <tr>
                  <th className="py-3 px-5">Drink Item</th>
                  <th className="py-3 px-5 text-center">Cups Sold</th>
                  <th className="py-3 px-5 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drinkRankingList.map((drink, idx) => (
                  <tr key={drink.name} className="hover:bg-slate-50">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {drink.name}
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-amber-900">
                      {formatNumber(drink.quantity)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-extrabold text-amber-950">
                      {formatCurrency(drink.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-700" />
              Operating Expense Category Breakdown
            </h3>
            <p className="text-xs text-slate-500">Distribution of expenditures by operational category</p>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {expenseCategoryList.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.category}</span>
                  <span className="text-rose-800 font-extrabold">{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reconciliation Audit Audit Report */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Register Reconciliation Audit Health</h3>
            <p className="text-xs text-slate-500">
              Audit score of end-of-day register cash & bank submissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-xs font-bold text-emerald-800 block">Matched Days</span>
            <span className="text-lg font-extrabold text-emerald-900">{matchedDaysCount} Days</span>
          </div>

          <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
            <span className="text-xs font-bold text-rose-800 block">Discrepancy Days</span>
            <span className="text-lg font-extrabold text-rose-900">{mismatchDaysCount} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};
