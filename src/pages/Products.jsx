import React, { useState, useEffect } from 'react';
import { Coffee, Plus, Search, Edit, Power, Check, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Badge } from '../components/UI/Badge';
import { ProductModal } from '../components/Forms/ProductModal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { api } from '../services/api';

export const Products = ({ showToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to fetch products configuration.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        showToast({ type: 'success', message: `Product "${productData.name}" updated successfully.` });
      } else {
        await api.addProduct(productData);
        showToast({ type: 'success', message: `New drink "${productData.name}" added successfully.` });
      }
      loadProducts();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to save product.' });
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.updateProduct(product.id, { status: newStatus });
      showToast({
        type: 'info',
        message: `Product "${product.name}" set to ${newStatus}.`
      });
      loadProducts();
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Failed to toggle product status.' });
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading drink products and pricing configuration..." />;
  }

  // Filter products safely
  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const searchLower = (searchTerm || '').toLowerCase();
    const nameLower = String(p.name || '').toLowerCase();
    const idLower = String(p.id || '').toLowerCase();
    const matchesSearch = nameLower.includes(searchLower) || idLower.includes(searchLower);
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(products.map(p => p?.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Drink Products & Pricing</h2>
            <p className="text-xs text-slate-500 font-medium">
              Configure selling prices and active status for cafe drink menu items.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search drinks by name or ID..."
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

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid / Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No drink products found"
          description="Adjust your search or add a new product."
          actionLabel="Add Product"
          onAction={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Product ID</th>
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-right">Configured Price</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-slate-500">
                      {p.id}
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-900 text-base">
                      {p.name}
                      {p.name === 'Moshaga Coffee' && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-900 border border-amber-300 rounded">
                          Cafe Specialty
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-slate-600 font-medium">
                      {p.category}
                    </td>

                    <td className="py-4 px-5 text-right font-extrabold text-amber-900 text-base">
                      {formatCurrency(p.sellingPrice)}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <Badge variant={p.status === 'Active' ? 'active' : 'inactive'}>
                        {p.status}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                          title="Edit Price & Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.status === 'Active' 
                              ? 'text-emerald-700 hover:bg-emerald-50' 
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={p.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
                        >
                          <Power className="w-4 h-4" />
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

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
