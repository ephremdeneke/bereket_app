import React, { useState, useEffect } from 'react';
import { Coffee, X } from 'lucide-react';

export const ProductModal = ({ isOpen, product, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hot Coffee');
  const [sellingPrice, setSellingPrice] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || 'Hot Coffee');
      setSellingPrice(product.sellingPrice || '');
      setStatus(product.status || 'Active');
    } else {
      setName('');
      setCategory('Hot Coffee');
      setSellingPrice('');
      setStatus('Active');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      category,
      sellingPrice: Number(sellingPrice) || 0,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {product ? 'Edit Product & Price' : 'Add New Drink Product'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Moshaga Special Blend"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="Hot Coffee">Hot Coffee</option>
              <option value="Hot Tea">Hot Tea</option>
              <option value="Beverage">Beverage</option>
              <option value="Speciality">Speciality Drink</option>
              <option value="Pastry / Snack">Pastry / Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Selling Price (ETB)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="e.g. 80"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                Active (Available for daily sales)
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={status === 'Inactive'}
                  onChange={() => setStatus('Inactive')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                Inactive
              </label>
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
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
