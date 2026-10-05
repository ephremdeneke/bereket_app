import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Search, AlertTriangle, ArrowUpRight, ArrowDownRight, History, Edit, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/UI/Badge';
import { InventoryModal } from '../components/Forms/InventoryModal';
import { StockTransactionModal } from '../components/Forms/StockTransactionModal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { api } from '../services/api';

export const Inventory = ({ showToast, refreshLowStockCount }) => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [selectedTxnItem, setSelectedTxnItem] = useState(null);

  const [showTxnHistoryModal, setShowTxnHistoryModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [iData, sData, tData] = await Promise.all([
        api.getInventory(),
        api.getSuppliers(),
        api.getInventoryHistory()
      ]);
      setInventory(iData || []);
      setSuppliers(sData || []);
      setTransactions(tData || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to load inventory data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveItem = async (itemData) => {
    try {
      if (editingItem) {
        await api.updateInventoryItem(editingItem.id, itemData);
        showToast({ type: 'success', message: `Item "${itemData.name}" updated successfully.` });
      } else {
        await api.addInventoryItem(itemData);
        showToast({ type: 'success', message: `New ingredient/supply "${itemData.name}" added.` });
      }
      loadData();
      if (refreshLowStockCount) refreshLowStockCount();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to save inventory item.' });
    }
  };

  const handleSaveTransaction = async (txnData) => {
    try {
      await api.addInventoryTransaction(txnData);
      showToast({ type: 'success', message: `Stock movement for "${txnData.itemName}" recorded!` });
      loadData();
      if (refreshLowStockCount) refreshLowStockCount();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to record stock transaction.' });
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading cafe ingredients & stock balances..." />;
  }

  const filteredInventory = inventory.filter(item => {
    if (!item) return false;
    const searchLower = (searchTerm || '').toLowerCase();
    const nameLower = String(item.name || '').toLowerCase();
    const idLower = String(item.id || '').toLowerCase();
    const matchesSearch = nameLower.includes(searchLower) || idLower.includes(searchLower);
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesLowStock = !showLowStockOnly || (Number(item.currentQuantity) || 0) <= (Number(item.minimumStock) || 0);

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = inventory.filter(i => (Number(i?.currentQuantity) || 0) <= (Number(i?.minimumStock) || 0)).length;
  const categories = Array.from(new Set(inventory.map(i => i?.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Inventory & Ingredients</h2>
            <p className="text-xs text-slate-500 font-medium">
              Track coffee beans, milk, sugar, cups, and Moshaga preparation materials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTxnHistoryModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            <span>Stock History</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search item name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
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
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle Button */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showLowStockOnly
                ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <EmptyState
          title="No inventory items found"
          description="Try changing your search terms or filter settings."
          actionLabel="Add Item"
          onAction={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Item ID</th>
                  <th className="py-3.5 px-5">Ingredient / Supply Item</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-center">Current Qty</th>
                  <th className="py-3.5 px-5 text-center">Min Stock</th>
                  <th className="py-3.5 px-5 text-right">Unit Cost</th>
                  <th className="py-3.5 px-5">Supplier</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow = (Number(item.currentQuantity) || 0) <= (Number(item.minimumStock) || 0);

                  return (
                    <tr key={item.id} className={`transition-colors ${isLow ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-slate-50/80'}`}>
                      <td className="py-4 px-5 font-mono text-xs font-bold text-slate-500">
                        {item.id}
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900 text-base">
                        {item.name}
                      </td>

                      <td className="py-4 px-5 text-slate-600 text-xs font-medium">
                        {item.category}
                      </td>

                      <td className={`py-4 px-5 text-center font-extrabold text-base ${isLow ? 'text-rose-700' : 'text-slate-900'}`}>
                        {item.currentQuantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </td>

                      <td className="py-4 px-5 text-center font-medium text-slate-600 text-xs">
                        {item.minimumStock} {item.unit}
                      </td>

                      <td className="py-4 px-5 text-right font-semibold text-slate-800">
                        {formatCurrency(item.purchaseCost)}
                      </td>

                      <td className="py-4 px-5 text-xs text-slate-600 max-w-[150px] truncate">
                        {item.supplierName || 'General Supplier'}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <Badge variant={isLow ? 'lowStock' : 'active'}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stock adjustment button */}
                          <button
                            onClick={() => {
                              setSelectedTxnItem(item);
                              setIsTxnModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1"
                            title="Record Stock In / Stock Out / Adjustment"
                          >
                            <span>Stock ±</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                            title="Edit Item Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Modal */}
      <InventoryModal
        isOpen={isItemModalOpen}
        item={editingItem}
        suppliers={suppliers}
        onSave={handleSaveItem}
        onClose={() => setIsItemModalOpen(false)}
      />

      {/* Stock Movement Transaction Modal */}
      <StockTransactionModal
        isOpen={isTxnModalOpen}
        item={selectedTxnItem}
        onSave={handleSaveTransaction}
        onClose={() => setIsTxnModalOpen(false)}
      />

      {/* Stock Transaction History Drawer Modal */}
      {showTxnHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Stock Movement Transaction History</h3>
                  <p className="text-xs text-slate-500 font-medium">Log of Stock In, Stock Out, and Adjustments</p>
                </div>
              </div>
              <button onClick={() => setShowTxnHistoryModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                    <th className="py-2.5 px-3 text-center">Quantity</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.map(txn => (
                    <tr key={txn.id}>
                      <td className="py-3 px-3 font-semibold text-slate-700">{formatDate(txn.date)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{txn.itemName}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          txn.transactionType === 'Stock In'
                            ? 'bg-emerald-100 text-emerald-800'
                            : txn.transactionType === 'Stock Out'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {txn.transactionType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {txn.quantity}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{txn.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTxnHistoryModal(false)}
                className="px-5 py-2 text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
