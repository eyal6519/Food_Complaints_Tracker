'use client';

import React from 'react';
import { Complaint, getComputedStatus, getDaysPending } from '@/types/complaint';
import { 
  X, 
  Building2, 
  Warehouse, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Hourglass, 
  Edit3, 
  Trash2,
  FileText,
  User,
  UserCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onEdit: (complaint: Complaint) => void;
  onDelete: (id: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!complaint) return null;

  const status = getComputedStatus(complaint);
  const daysPending = getDaysPending(complaint.dateSentToSupplier);

  const formatDateSafe = (dStr: string | null | undefined) => {
    if (!dStr) return '-';
    try {
      return format(parseISO(dStr), 'MMMM dd, yyyy');
    } catch {
      return dStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800">
              {complaint.category}
            </span>
            {status === 'RESOLVED' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
              </span>
            )}
            {status === 'OVERDUE' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Overdue ({daysPending} days)
              </span>
            )}
            {status === 'PENDING' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Hourglass className="w-3.5 h-3.5 text-amber-600" /> Pending ({daysPending} days)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Supplier & Warehouse Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Supplier</div>
                <div className="text-base font-bold text-slate-900">{complaint.supplierName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
              <Warehouse className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-500 font-medium">Warehouse Origin</div>
                <div className="text-sm font-semibold text-slate-800">{complaint.warehouseName}</div>
              </div>
            </div>
          </div>

          {/* Timeline with User Activity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Process & Activity Timeline</h3>
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-xs" />
                <div className="text-xs text-slate-500">Complaint Received from Warehouse</div>
                <div className="text-sm font-semibold text-slate-800">{formatDateSafe(complaint.dateSentToUs)}</div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                <div className="text-xs text-slate-500">Letter Sent to Supplier</div>
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span>{formatDateSafe(complaint.dateSentToSupplier)}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (Logged by <strong>{complaint.createdBy || 'Team Member'}</strong>)
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  complaint.dateResponseReceived ? 'bg-emerald-600' : 'bg-slate-300'
                }`} />
                <div className="text-xs text-slate-500">Supplier Response & Resolution</div>
                {complaint.dateResponseReceived ? (
                  <div className="text-sm font-semibold text-emerald-700 space-y-0.5">
                    <div>Received on {formatDateSafe(complaint.dateResponseReceived)}</div>
                    {complaint.resolvedBy && (
                      <div className="text-xs font-normal text-emerald-800">
                        Resolved & recorded by <strong>{complaint.resolvedBy}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">Awaiting response ({daysPending} days elapsed)</div>
                )}
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Description of Issue
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Notes if present */}
          {complaint.notes && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Resolution Notes</h3>
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-sm text-emerald-900 whitespace-pre-wrap">
                {complaint.notes}
              </div>
            </div>
          )}

          {/* Audit trail footer summary */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Created by <strong className="text-slate-600">{complaint.createdBy || 'Team Member'}</strong></span>
            </div>
            {complaint.updatedBy && (
              <div>
                Last updated by <strong className="text-slate-600">{complaint.updatedBy}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(complaint.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(complaint);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              <Edit3 className="w-4 h-4" /> Edit Record
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
