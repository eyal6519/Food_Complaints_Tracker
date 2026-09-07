'use client';

import React, { useState, useEffect } from 'react';
import { Complaint } from '@/types/complaint';
import { EditableCombobox } from './EditableCombobox';
import { X, Save, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Complaint>) => Promise<void>;
  initialData?: Complaint | null;
  suggestions: {
    categories: string[];
    suppliers: string[];
    warehouses: string[];
  };
}

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  suggestions
}) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [category, setCategory] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [dateSentToUs, setDateSentToUs] = useState(todayStr);
  const [dateSentToSupplier, setDateSentToSupplier] = useState(todayStr);
  const [description, setDescription] = useState('');
  const [dateResponseReceived, setDateResponseReceived] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || '');
      setSupplierName(initialData.supplierName || '');
      setWarehouseName(initialData.warehouseName || '');
      setDateSentToUs(initialData.dateSentToUs || todayStr);
      setDateSentToSupplier(initialData.dateSentToSupplier || todayStr);
      setDescription(initialData.description || '');
      setDateResponseReceived(initialData.dateResponseReceived || '');
      setNotes(initialData.notes || '');
    } else {
      setCategory('');
      setSupplierName('');
      setWarehouseName('');
      setDateSentToUs(todayStr);
      setDateSentToSupplier(todayStr);
      setDescription('');
      setDateResponseReceived('');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !supplierName.trim() || !warehouseName.trim() || !dateSentToUs || !dateSentToSupplier || !description.trim()) {
      setErrorMsg('Please fill in all required fields (Category, Supplier, Warehouse, Dates, Description).');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await onSave({
        category: category.trim(),
        supplierName: supplierName.trim(),
        warehouseName: warehouseName.trim(),
        dateSentToUs: dateSentToUs.trim(),
        dateSentToSupplier: dateSentToSupplier.trim(),
        description: description.trim(),
        dateResponseReceived: dateResponseReceived.trim() ? dateResponseReceived.trim() : null,
        notes: notes.trim() ? notes.trim() : undefined
      });
      onClose();
    } catch (err) {
      setErrorMsg('Failed to save: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Complaint Process' : 'New Complaint Record'}
            </h2>
            <p className="text-xs text-slate-500">
              {initialData ? 'Update process details and supplier feedback' : 'Record a new warehouse complaint sent to supplier'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Category Combobox */}
          <EditableCombobox
            label="Category (Food Issue Type)"
            value={category}
            onChange={setCategory}
            options={suggestions.categories}
            placeholder="e.g. Temperature Abuse, Packaging Damage, Expired..."
            required
          />

          {/* Supplier & Warehouse Comboboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditableCombobox
              label="Supplier Name"
              value={supplierName}
              onChange={setSupplierName}
              options={suggestions.suppliers}
              placeholder="e.g. Tnuva Dairy, Strauss..."
              required
            />
            <EditableCombobox
              label="Warehouse / DC"
              value={warehouseName}
              onChange={setWarehouseName}
              options={suggestions.warehouses}
              placeholder="e.g. Northern Distribution Center..."
              required
            />
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Date Received from Warehouse <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateSentToUs}
                  onChange={(e) => setDateSentToUs(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Date Sent to Supplier <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateSentToSupplier}
                  onChange={(e) => setDateSentToSupplier(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description of the Issue <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the issue (e.g. pallet temperature, batch numbers, torn boxes, credit note request)..."
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-slate-400 shadow-sm"
            />
          </div>

          {/* Resolution & Response Section */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900">
                Supplier Response (Optional)
              </label>
              {!dateResponseReceived && (
                <button
                  type="button"
                  onClick={() => setDateResponseReceived(todayStr)}
                  className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Set Today as Response Date
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Date Response Received</label>
                <input
                  type="date"
                  value={dateResponseReceived}
                  onChange={(e) => setDateResponseReceived(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Response Notes / Resolution</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Credit issued, replacement shipped..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : initialData ? 'Update Complaint' : 'Save Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
