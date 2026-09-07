'use client';

import React, { useState, useEffect } from 'react';
import { Complaint } from '@/types/complaint';
import { X, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface QuickResolveModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, responseDate: string, notes?: string) => Promise<void>;
}

export const QuickResolveModal: React.FC<QuickResolveModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onConfirm
}) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const [dateResponseReceived, setDateResponseReceived] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && complaint) {
      setDateResponseReceived(todayStr);
      setNotes(complaint.notes || '');
    }
  }, [isOpen, complaint, todayStr]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateResponseReceived) return;

    try {
      setLoading(true);
      await onConfirm(complaint.id, dateResponseReceived, notes.trim() ? notes.trim() : undefined);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Resolve Complaint</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {complaint.supplierName} • {complaint.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Response Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateResponseReceived}
              onChange={(e) => setDateResponseReceived(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            {/* Quick date presets */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setDateResponseReceived(todayStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  dateResponseReceived === todayStr
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateResponseReceived(yesterdayStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  dateResponseReceived === yesterdayStr
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Yesterday
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Resolution Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Full credit note #CR-9012 issued, supplier agreed to credit warehouse..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Resolving...' : 'Mark Resolved'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
