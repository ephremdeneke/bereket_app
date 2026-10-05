import React, { useState, useEffect } from 'react';
import { CalendarPlus, CheckCircle2, History } from 'lucide-react';
import { DailySalesForm } from '../components/Forms/DailySalesForm';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const DailySales = ({ showToast }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, sData] = await Promise.all([
        api.getProducts(),
        api.getDailySales()
      ]);
      setProducts(pData || []);
      setDailySales(sData || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to load products or sales data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveReport = async (reportData) => {
    setSaving(true);
    try {
      await api.saveDailySales(reportData);
      showToast({
        type: 'success',
        message: `Daily sales report for ${reportData.date} saved successfully (${reportData.reconciliationStatus}).`
      });
      navigate('/sales-history');
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Error saving daily sales report to database.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading products and sales recorder..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Sales Recording</h2>
            <p className="text-xs text-slate-500 font-medium">
              Record drink quantities sold today. System automatically calculates sales and reconciles Cash & Bank.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/sales-history')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
        >
          <History className="w-4 h-4" />
          <span>View Sales History</span>
        </button>
      </div>

      {/* Daily Sales Recording Form */}
      <DailySalesForm
        products={products}
        existingReport={selectedReport}
        onSave={handleSaveReport}
        isSaving={saving}
      />
    </div>
  );
};
