import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2, AlertTriangle, Plus, Minus, FileText, DollarSign } from 'lucide-react';
import { formatCurrency, getTodayFormatted } from '../../utils/formatters';
import { calculateDailySalesTotal, calculateReconciliation } from '../../utils/calculations';
import { Badge } from '../UI/Badge';

export const DailySalesForm = ({ products = [], existingReport = null, onSave, isSaving = false }) => {
  const [date, setDate] = useState(existingReport ? existingReport.date : getTodayFormatted());
  const [quantities, setQuantities] = useState({});
  const [cashSales, setCashSales] = useState('');
  const [bankSales, setBankSales] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize quantities from existing report or products defaults
  useEffect(() => {
    if (existingReport) {
      setDate(existingReport.date);
      setCashSales(existingReport.cashSales || '');
      setBankSales(existingReport.bankSales || '');
      setNotes(existingReport.notes || '');

      const qMap = {};
      if (existingReport.items && existingReport.items.length) {
        existingReport.items.forEach(item => {
          qMap[item.productId] = item.quantity;
        });
      }
      setQuantities(qMap);
    } else {
      const initialQ = {};
      products.forEach(p => {
        initialQ[p.id] = 0;
      });
      setQuantities(initialQ);
      setCashSales('');
      setBankSales('');
      setNotes('');
    }
  }, [existingReport, products]);

  // Handle quantity adjustments
  const handleQuantityChange = (productId, val) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setQuantities(prev => ({
      ...prev,
      [productId]: qty
    }));
  };

  const handleIncrement = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleDecrement = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1)
    }));
  };

  // Active products list
  const activeProducts = products.filter(p => p.status === 'Active' || (existingReport && quantities[p.id] > 0));

  // Build items array for calculation
  const salesItems = activeProducts.map(prod => ({
    productId: prod.id,
    productName: prod.name,
    quantity: quantities[prod.id] || 0,
    unitPrice: prod.sellingPrice
  }));

  const { items: calculatedItems, totalCalculatedSales } = calculateDailySalesTotal(salesItems, activeProducts);
  const { recordedTotal, difference, status } = calculateReconciliation(totalCalculatedSales, cashSales, bankSales);

  const handleSubmit = (e) => {
    e.preventDefault();

    const reportData = {
      salesId: existingReport ? existingReport.id : `SALE-${date.replace(/-/g, '')}`,
      date,
      calculatedSales: totalCalculatedSales,
      cashSales: Number(cashSales) || 0,
      bankSales: Number(bankSales) || 0,
      recordedTotal,
      difference,
      reconciliationStatus: status,
      notes: notes.trim(),
      items: calculatedItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        calculatedAmount: item.calculatedAmount
      }))
    };

    onSave(reportData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Report Date
          </label>
          <div className="relative max-w-xs">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">Reconciliation Status</span>
            <div className="mt-0.5">
              <Badge variant={status === 'Matched' ? 'matched' : 'mismatch'} className="px-3 py-1 text-sm font-bold">
                {status === 'Matched' ? (
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Matched</span>
                ) : (
                  <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Mismatch ({formatCurrency(difference)})</span>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Drink Quantities Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Drink Daily Quantities</h3>
            <p className="text-xs text-slate-500">Enter total quantities sold for each beverage today</p>
          </div>
          <span className="text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
            {activeProducts.length} Configured Drinks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Product Drink</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Selling Price</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Quantity Sold</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Calculated Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculatedItems.map((item) => (
                <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                    {item.productName}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right font-medium text-slate-600">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item.productId)}
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors shadow-2xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        value={quantities[item.productId] ?? 0}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        className="w-16 sm:w-20 text-center py-1.5 font-bold text-base bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleIncrement(item.productId)}
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right font-extrabold text-amber-900 text-base">
                    {formatCurrency(item.calculatedAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-amber-50/60 border-t-2 border-amber-200">
              <tr>
                <td colSpan="3" className="py-4 px-4 sm:px-6 font-bold text-slate-800 text-base">
                  Calculated Daily Sales Total
                </td>
                <td className="py-4 px-4 sm:px-6 text-right font-extrabold text-amber-900 text-lg">
                  {formatCurrency(totalCalculatedSales)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cash / Bank Reconciliation Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-700" />
            Cash & Bank Payment Reconciliation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter the actual amounts collected in Cash register and Bank transfer accounts today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Cash Sales (ETB)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 3450"
              value={cashSales}
              onChange={(e) => setCashSales(e.target.value)}
              className="w-full px-4 py-3 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Bank Sales (Telebirr / CBE / Bank) (ETB)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 2500"
              value={bankSales}
              onChange={(e) => setBankSales(e.target.value)}
              className="w-full px-4 py-3 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Reconciliation Summary Box */}
        <div className={`p-4 rounded-xl border ${
          status === 'Matched' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Calculated Product Sales</span>
              <span className="text-base font-bold text-slate-900">{formatCurrency(totalCalculatedSales)}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block">Recorded Total (Cash + Bank)</span>
              <span className="text-base font-bold text-slate-900">{formatCurrency(recordedTotal)}</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block">Discrepancy / Difference</span>
              <span className={`text-base font-extrabold ${difference === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(difference)}
              </span>
            </div>
          </div>

          {status === 'Mismatch' && (
            <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center gap-2 text-xs font-semibold text-rose-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Warning: Recorded Cash + Bank total does not equal calculated drink sales by {formatCurrency(Math.abs(difference))}.</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            Shift Notes / Comments
          </label>
          <textarea
            rows="2"
            placeholder="Add any notes regarding discounts, shift shortages, or general observation..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Saving Daily Report...' : 'Save Daily Report'}</span>
        </button>
      </div>
    </form>
  );
};
