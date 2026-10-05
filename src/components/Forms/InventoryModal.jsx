import React, { useState, useEffect } from 'react';
import { Boxes, X } from 'lucide-react';

export const InventoryModal = ({ isOpen, item, suppliers = [], onSave, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Coffee Beans');
  const [unit, setUnit] = useState('kg');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [supplierId, setSupplierId] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || 'Coffee Beans');
      setUnit(item.unit || 'kg');
      setCurrentQuantity(item.currentQuantity ?? '');
      setMinimumStock(item.minimumStock ?? '');
      setPurchaseCost(item.purchaseCost ?? '');
      setSupplierId(item.supplierId || (suppliers[0] ? suppliers[0].id : ''));
    } else {
      setName('');
      setCategory('Coffee Beans');
      setUnit('kg');
      setCurrentQuantity('');
      setMinimumStock('');
      setPurchaseCost('');
      setSupplierId(suppliers[0] ? suppliers[0].id : '');
    }
  }, [item, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selSupplier = suppliers.find(s => s.id === supplierId);
    onSave({
      name: name.trim(),
      category,
      unit,
      currentQuantity: Number(currentQuantity) || 0,
      minimumStock: Number(minimumStock) || 0,
      purchaseCost: Number(purchaseCost) || 0,
      supplierId: supplierId || '',
      supplierName: selSupplier ? selSupplier.name : 'General Supplier'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {item ? 'Edit Inventory Item' : 'Add Inventory Ingredient/Supply'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Roasted Sidama Coffee Beans"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="Coffee Beans">Coffee Beans</option>
                <option value="Milk & Dairy">Milk & Dairy</option>
                <option value="Tea Leaves">Tea Leaves</option>
                <option value="Sugar & Sweeteners">Sugar & Sweeteners</option>
                <option value="Cups & Packaging">Cups & Packaging</option>
                <option value="Moshaga Ingredients">Moshaga Ingredients</option>
                <option value="Supplies">Supplies & Cleaning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                required
                placeholder="e.g. kg, L, pcs, bottles"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Current Stock Qty
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Minimum Alert Stock
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Unit Purchase Cost (ETB)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
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
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
