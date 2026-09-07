'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Complaint, getComputedStatus, SafeUser } from '@/types/complaint';
import { Header } from '@/components/Header';
import { StatsSummary } from '@/components/StatsSummary';
import { ComplaintCard } from '@/components/ComplaintCard';
import { ComplaintTableView } from '@/components/ComplaintTableView';
import { ComplaintFormModal } from '@/components/ComplaintFormModal';
import { ComplaintDetailModal } from '@/components/ComplaintDetailModal';
import { QuickResolveModal } from '@/components/QuickResolveModal';
import { UserManagementModal } from '@/components/UserManagementModal';
import { LoginModal } from '@/components/LoginModal';
import { ToastProvider, useToast } from '@/components/Toast';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  CheckCircle2,
  X,
  SlidersHorizontal
} from 'lucide-react';

function DashboardContent() {
  const { success, error, info } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(null);

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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'PENDING' | 'RESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [quickResolveTarget, setQuickResolveTarget] = useState<Complaint | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Check auth
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setCurrentUser(null);
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
    setCurrentUser(null);
    info('Signed out', 'You have been signed out successfully.');
  };

  // Create / Update Complaint
  const handleSaveComplaint = async (data: Partial<Complaint>) => {
    if (editingComplaint) {
      const res = await fetch(`/api/complaints/${editingComplaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.error || 'Failed to update');
      success('Complaint updated', `Record for ${data.supplierName} has been saved.`);
    } else {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) throw new Error(resData.error || 'Failed to create');
      success('Complaint logged', `New complaint for ${data.supplierName} created.`);
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
        success('Complaint deleted', 'Record has been removed.');
      }
    } catch (err) {
      error('Delete failed', String(err));
    }
  };

  // Confirm Quick Resolve
  const handleConfirmQuickResolve = async (id: string, responseDate: string, notes?: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateResponseReceived: responseDate,
          notes
        })
      });

      if (!res.ok) throw new Error('Failed to resolve');
      await fetchData();
      success('Complaint resolved', 'Supplier response recorded successfully.');
    } catch (err: any) {
      error('Resolution failed', err.message);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      window.location.href = '/api/export';
      success('Export started', 'Your CSV file download should begin shortly.');
    } finally {
      setTimeout(() => setIsExporting(false), 1200);
    }
  };

  // Unique list of creators / handlers for the filter
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((c) => {
      if (c.createdBy) set.add(c.createdBy);
      if (c.resolvedBy) set.add(c.resolvedBy);
    });
    return Array.from(set).sort();
  }, [complaints]);

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

      // User filter
      if (userFilter !== 'ALL' && c.createdBy !== userFilter && c.resolvedBy !== userFilter) {
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
        const matchesUser = (c.createdBy && c.createdBy.toLowerCase().includes(query)) ||
                            (c.resolvedBy && c.resolvedBy.toLowerCase().includes(query));

        if (!matchesSupplier && !matchesWarehouse && !matchesCategory && !matchesDesc && !matchesNotes && !matchesUser) {
          return false;
        }
      }

      return true;
    });
  }, [complaints, statusFilter, categoryFilter, supplierFilter, userFilter, searchQuery]);

  if (isAuthenticated === false) {
    return <LoginModal onSuccess={checkAuth} />;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <Header
        currentUser={currentUser}
        onNewComplaint={() => {
          setEditingComplaint(null);
          setIsFormOpen(true);
        }}
        onExportCsv={handleExportCsv}
        onLogout={handleLogout}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        isExporting={isExporting}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        {/* Statistics Banner & Status Tabs */}
        <StatsSummary
          complaints={complaints}
          activeFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />

        {/* Search and Filter Toolbar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-5 space-y-3">
          <div className="flex flex-col lg:flex-row items-center gap-2.5 sm:gap-3">
            {/* Live Search Input */}
            <div className="relative w-full lg:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints by supplier, warehouse, issue, or teammate..."
                className="w-full pl-10 pr-9 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Category */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="ALL">All Categories</option>
                {suggestions.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Supplier */}
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="ALL">All Suppliers</option>
                {suggestions.suppliers.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>

              {/* Team Member Filter */}
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="ALL">All Members</option>
                {uniqueUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || supplierFilter !== 'ALL' || userFilter !== 'ALL' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold flex items-center gap-1 text-[11px] text-slate-400">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" /> Filters:
              </span>

              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium">
                  Status: {statusFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setStatusFilter('ALL')} />
                </span>
              )}

              {categoryFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium">
                  Category: {categoryFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setCategoryFilter('ALL')} />
                </span>
              )}

              {supplierFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium">
                  Supplier: {supplierFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSupplierFilter('ALL')} />
                </span>
              )}

              {userFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium">
                  Member: {userFilter}
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setUserFilter('ALL')} />
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium">
                  "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer hover:text-rose-600" onClick={() => setSearchQuery('')} />
                </span>
              )}

              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setSupplierFilter('ALL');
                  setUserFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-[11px] text-emerald-700 font-semibold hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Complaints Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Complaints ({filteredComplaints.length})
            </h2>
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {loading && complaints.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse h-44 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded w-2/3" />
                  <div className="h-10 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center max-w-md mx-auto my-8 space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No complaints found</h3>
              <p className="text-xs text-slate-500">
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || supplierFilter !== 'ALL' || userFilter !== 'ALL'
                  ? 'No records match your active search or filters.'
                  : 'No complaints logged yet. Add your first complaint to start tracking.'}
              </p>
              <button
                onClick={() => {
                  setEditingComplaint(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Log Complaint
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <ComplaintTableView
              complaints={filteredComplaints}
              onEdit={(comp) => {
                setEditingComplaint(comp);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteComplaint}
              onQuickResolve={(comp) => setQuickResolveTarget(comp)}
              onViewDetails={(comp) => setViewingComplaint(comp)}
            />
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
                  onQuickResolve={(comp) => setQuickResolveTarget(comp)}
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
          aria-label="New Complaint"
          className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Add / Edit Complaint Modal */}
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

      {/* Quick Resolve Modal */}
      <QuickResolveModal
        complaint={quickResolveTarget}
        isOpen={Boolean(quickResolveTarget)}
        onClose={() => setQuickResolveTarget(null)}
        onConfirm={handleConfirmQuickResolve}
      />

      {/* Team Members Management Modal */}
      <UserManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
