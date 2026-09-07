'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Complaint, getComputedStatus } from '@/types/complaint';
import { Header } from '@/components/Header';
import { StatsSummary } from '@/components/StatsSummary';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintFormModal } from '@/components/ComplaintFormModal';
import { ComplaintDetailModal } from '@/components/ComplaintDetailModal';
import { LoginModal } from '@/components/LoginModal';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [suggestions, setSuggestions] = useState<{
    categories: string[];
    suppliers: string[];
    warehouses: string[];
  }>({
    categories: [],
    suppliers: [],
    warehouses: []
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'PENDING' | 'RESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Check auth
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, sugRes] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/suggestions')
      ]);

      const compData = await compRes.json();
      const sugData = await sugRes.json();

      if (compData.success) {
        setComplaints(compData.data);
      }
      if (sugData.success) {
        setSuggestions(sugData.data);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  // Create / Update Complaint
  const handleSaveComplaint = async (data: Partial<Complaint>) => {
    if (editingComplaint) {
      // Update
      const res = await fetch(`/api/complaints/${editingComplaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.error || 'Failed to update');
    } else {
      // Create
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.error || 'Failed to create');
    }

    await fetchData();
  };

  // Delete Complaint
  const handleDeleteComplaint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint record?')) return;
    try {
      const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setComplaints((prev) => prev.filter((c) => c.id !== id));
        if (viewingComplaint?.id === id) setViewingComplaint(null);
      }
    } catch (err) {
      alert('Failed to delete complaint: ' + String(err));
    }
  };

  // Quick Resolve Today
  const handleQuickResolve = async (complaint: Complaint) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...complaint,
          dateResponseReceived: todayStr
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      alert('Failed to resolve complaint: ' + String(err));
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      window.location.href = '/api/export';
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const status = getComputedStatus(c);

      // Status filter
      if (statusFilter !== 'ALL' && status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
        return false;
      }

      // Supplier filter
      if (supplierFilter !== 'ALL' && c.supplierName !== supplierFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesSupplier = c.supplierName.toLowerCase().includes(query);
        const matchesWarehouse = c.warehouseName.toLowerCase().includes(query);
        const matchesCategory = c.category.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        const matchesNotes = c.notes?.toLowerCase().includes(query);
        if (!matchesSupplier && !matchesWarehouse && !matchesCategory && !matchesDesc && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [complaints, statusFilter, categoryFilter, supplierFilter, searchQuery]);

  if (isAuthenticated === false) {
    return <LoginModal onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header
        onNewComplaint={() => {
          setEditingComplaint(null);
          setIsFormOpen(true);
        }}
        onExportCsv={handleExportCsv}
        onLogout={handleLogout}
        isExporting={isExporting}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Statistics Banner & Status Tabs */}
        <StatsSummary
          complaints={complaints}
          activeFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />

        {/* Search and Secondary Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Live Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by supplier, warehouse, issue, or keyword..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <div className="w-full sm:w-auto flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="ALL">All Categories</option>
                {suggestions.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Supplier Dropdown Filter */}
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="ALL">All Suppliers</option>
                {suggestions.suppliers.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || supplierFilter !== 'ALL' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Active filters:
              </span>

              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium">
                  Status: {statusFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setStatusFilter('ALL')} />
                </span>
              )}

              {categoryFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium">
                  Category: {categoryFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setCategoryFilter('ALL')} />
                </span>
              )}

              {supplierFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium">
                  Supplier: {supplierFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSupplierFilter('ALL')} />
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSearchQuery('')} />
                </span>
              )}

              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setSupplierFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-emerald-700 font-semibold hover:underline ml-auto"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Complaints List / Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Complaints Log ({filteredComplaints.length})
            </h2>
            <button
              onClick={fetchData}
              title="Refresh"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {loading && complaints.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse h-48 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded w-2/3" />
                  <div className="h-12 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md mx-auto my-8 space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No complaints found</h3>
              <p className="text-xs text-slate-500">
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || supplierFilter !== 'ALL'
                  ? 'No complaint records match your current filter criteria.'
                  : 'No complaints logged yet. Click the button below to add the first one.'}
              </p>
              <button
                onClick={() => {
                  setEditingComplaint(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onEdit={(comp) => {
                    setEditingComplaint(comp);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteComplaint}
                  onQuickResolve={handleQuickResolve}
                  onViewDetails={(comp) => setViewingComplaint(comp)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (FAB) for Mobile screens */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          onClick={() => {
            setEditingComplaint(null);
            setIsFormOpen(true);
          }}
          aria-label="Add Complaint"
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Complaint Add / Edit Modal */}
      <ComplaintFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingComplaint(null);
        }}
        onSave={handleSaveComplaint}
        initialData={editingComplaint}
        suggestions={suggestions}
      />

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaint={viewingComplaint}
        onClose={() => setViewingComplaint(null)}
        onEdit={(comp) => {
          setEditingComplaint(comp);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteComplaint}
      />
    </div>
  );
}
