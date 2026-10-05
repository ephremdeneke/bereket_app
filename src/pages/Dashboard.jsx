import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Wallet,
  Coffee,
  AlertTriangle,
  Calendar,
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { SummaryCard } from '../components/Cards/SummaryCard';
import { SalesTrendChart } from '../components/Charts/SalesTrendChart';
import { ExpenseTrendChart } from '../components/Charts/ExpenseTrendChart';
import { CashBankChart } from '../components/Charts/CashBankChart';
import { SalesByDrinkChart } from '../components/Charts/SalesByDrinkChart';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Badge } from '../components/UI/Badge';
import { formatCurrency, formatNumber, getTodayFormatted } from '../utils/formatters';
import { calculateNetIncome } from '../utils/calculations';
import { api } from '../services/api';

export const Dashboard = ({ showToast }) => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('Today'); // Today, This Week, This Month
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [pData, sData, iData, eData] = await Promise.all([
        api.getProducts(),
        api.getDailySales(),
        api.getInventory(),
        api.getExpenses()
      ]);

      setProducts(pData || []);
      setDailySales(sData || []);
      setInventory(iData || []);
      setExpenses(eData || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to load dashboard metrics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Analyzing moshaga Cafe business metrics..." size="lg" />;
  }

  const todayStr = getTodayFormatted();
  const todayReport = dailySales.find(s => s.date === todayStr);

  // Timeframe Data Filtering Logic
  const getFilteredSales = () => {
    const now = new Date();
    if (timeframe === 'Today') {
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

  // Summary Card Metrics
  const totalSalesVal = filteredSales.reduce((acc, curr) => acc + (Number(curr.calculatedSales) || 0), 0);
  const totalCashVal = filteredSales.reduce((acc, curr) => acc + (Number(curr.cashSales) || 0), 0);
  const totalBankVal = filteredSales.reduce((acc, curr) => acc + (Number(curr.bankSales) || 0), 0);
  const totalExpensesVal = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netIncomeVal = calculateNetIncome(totalSalesVal, totalExpensesVal);

  // Total Drinks Sold
  let totalDrinksSold = 0;
  const drinkSalesMap = {};
  filteredSales.forEach(sale => {
    if (sale.items && sale.items.length) {
      sale.items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        totalDrinksSold += qty;
        drinkSalesMap[item.productName] = (drinkSalesMap[item.productName] || 0) + qty;
      });
    }
  });

  // Low Stock Items count
  const lowStockItems = inventory.filter(item => (Number(item.currentQuantity) || 0) <= (Number(item.minimumStock) || 0));

  // Chart Data Formatting
  // 1. Sales Trend Data
  const sortedSalesForChart = [...dailySales]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map(s => ({
      label: s.date ? s.date.slice(5) : '',
      amount: Number(s.calculatedSales) || 0
    }));

  // 2. Expense Trend Data
  const expenseChartMap = {};
  filteredExpenses.forEach(e => {
    const key = e.date ? e.date.slice(5) : 'Other';
    expenseChartMap[key] = (expenseChartMap[key] || 0) + (Number(e.amount) || 0);
  });
  const sortedExpensesForChart = Object.keys(expenseChartMap).map(k => ({
    label: k,
    amount: expenseChartMap[k]
  }));

  // 4. Sales By Drink Chart Data
  const salesByDrinkChartData = Object.keys(drinkSalesMap).map(pName => ({
    name: pName,
    quantity: drinkSalesMap[pName]
  })).sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="space-y-6">
      {/* Timeframe selector header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Business Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time daily financial totals and inventory metrics</p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {['Today', 'This Week', 'This Month'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Banners */}
      {/* 1. Unreconciled Sales Alert */}
      {todayReport && todayReport.reconciliationStatus === 'Mismatch' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">Today's Daily Sales has a Reconciliation Mismatch!</p>
              <p className="text-xs text-rose-700">Recorded total differs from calculated drink sales by {formatCurrency(todayReport.difference)}.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/daily-sales')}
            className="px-3.5 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-2xs transition-colors flex items-center gap-1 shrink-0"
          >
            Fix Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Today Sales missing notice */}
      {!todayReport && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Today's daily sales haven't been saved yet.</p>
              <p className="text-xs text-amber-800">Record today's drink quantities to update daily revenues and cash drops.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/daily-sales')}
            className="px-4 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            Record Today's Sales <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title={`${timeframe} Sales`}
          value={formatCurrency(totalSalesVal)}
          subtitle={timeframe === 'Today' ? (todayReport ? 'Recorded today' : 'Pending entry') : `${filteredSales.length} daily reports`}
          icon={TrendingUp}
          color="amber"
          onClick={() => navigate('/sales-history')}
        />

        <SummaryCard
          title="Cash Sales"
          value={formatCurrency(totalCashVal)}
          subtitle="Direct register cash"
          icon={Wallet}
          color="teal"
        />

        <SummaryCard
          title="Bank Sales"
          value={formatCurrency(totalBankVal)}
          subtitle="Telebirr / CBE / Transfer"
          icon={DollarSign}
          color="indigo"
        />

        <SummaryCard
          title={`${timeframe} Expenses`}
          value={formatCurrency(totalExpensesVal)}
          subtitle={`${filteredExpenses.length} expense transactions`}
          icon={Receipt}
          color="rose"
          onClick={() => navigate('/expenses')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Net Business Income"
          value={formatCurrency(netIncomeVal)}
          subtitle="Total Sales minus Total Expenses"
          icon={TrendingUp}
          color={netIncomeVal >= 0 ? 'emerald' : 'rose'}
          badge={<Badge variant={netIncomeVal >= 0 ? 'matched' : 'mismatch'}>{netIncomeVal >= 0 ? 'Profit' : 'Loss'}</Badge>}
        />

        <SummaryCard
          title="Total Drinks Sold"
          value={formatNumber(totalDrinksSold)}
          subtitle={`Across ${salesByDrinkChartData.length} drink categories`}
          icon={Coffee}
          color="sky"
          onClick={() => navigate('/products')}
        />

        <SummaryCard
          title="Low Stock Alert Items"
          value={`${lowStockItems.length} Items`}
          subtitle={lowStockItems.length > 0 ? 'Requires immediate restock' : 'All stock levels normal'}
          icon={AlertTriangle}
          color={lowStockItems.length > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/inventory')}
          badge={lowStockItems.length > 0 ? <Badge variant="lowStock">Alert</Badge> : <Badge variant="matched">OK</Badge>}
        />
      </div>

      {/* Dashboard Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Sales Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales Trend</h3>
              <p className="text-xs text-slate-500">Daily sales revenue over recent periods</p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">ETB</span>
          </div>
          <SalesTrendChart data={sortedSalesForChart} />
        </div>

        {/* 2. Expense Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Expense Trend</h3>
              <p className="text-xs text-slate-500">Operating expense breakdown by day</p>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">ETB</span>
          </div>
          <ExpenseTrendChart data={sortedExpensesForChart} />
        </div>

        {/* 3. Cash vs Bank Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cash vs Bank Payments</h3>
              <p className="text-xs text-slate-500">Payment channel distribution ({timeframe})</p>
            </div>
          </div>
          <CashBankChart cashAmount={totalCashVal} bankAmount={totalBankVal} />
        </div>

        {/* 4. Sales By Drink */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales by Drink (Volume)</h3>
              <p className="text-xs text-slate-500">Drink quantities sold during {timeframe}</p>
            </div>
          </div>
          <SalesByDrinkChart data={salesByDrinkChartData} />
        </div>
      </div>

      {/* Low Stock Highlight Table */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="text-base font-bold text-amber-950">Low Stock Ingredients & Supplies Alert</h3>
                <p className="text-xs text-amber-800">These items have reached or dropped below minimum safety levels</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
            >
              Manage Inventory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase">
                <tr>
                  <th className="py-3 px-5">Ingredient / Item</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5 text-center">Current Qty</th>
                  <th className="py-3 px-5 text-center">Min Stock</th>
                  <th className="py-3 px-5">Supplier</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockItems.map(item => (
                  <tr key={item.id} className="hover:bg-amber-50/30">
                    <td className="py-3 px-5 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-5 text-slate-600 text-xs">{item.category}</td>
                    <td className="py-3 px-5 text-center font-bold text-rose-700">{item.currentQuantity} {item.unit}</td>
                    <td className="py-3 px-5 text-center text-slate-600">{item.minimumStock} {item.unit}</td>
                    <td className="py-3 px-5 text-xs text-slate-600">{item.supplierName || 'General'}</td>
                    <td className="py-3 px-5 text-right">
                      <Badge variant="lowStock">Low Stock</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
