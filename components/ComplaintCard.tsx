'use client';

import React from 'react';
import { Complaint, getComputedStatus, getDaysPending } from '@/types/complaint';
import { 
  Building2, 
  Warehouse, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Hourglass, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Check,
  UserCheck,
  User
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ComplaintCardProps {
  complaint: Complaint;
  onEdit: (complaint: Complaint) => void;
  onDelete: (id: string) => void;
  onQuickResolve: (complaint: Complaint) => void;
  onViewDetails: (complaint: Complaint) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onEdit,
  onDelete,
  onQuickResolve,
  onViewDetails
}) => {
  const status = getComputedStatus(complaint);
  const daysPending = getDaysPending(complaint.dateSentToSupplier);

  const formatDateSafe = (dStr: string | null | undefined) => {
    if (!dStr) return '-';
    try {
      return format(parseISO(dStr), 'dd MMM yyyy');
    } catch {
      return dStr;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Overdue ({daysPending} days)
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Hourglass className="w-3.5 h-3.5 text-amber-600" />
            Pending ({daysPending}d)
          </span>
        );
    }
  };

  return (
    <div className={`relative bg-white rounded-2xl p-4 md:p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
      status === 'OVERDUE' 
        ? 'border-rose-200 bg-gradient-to-br from-rose-50/20 to-white' 
        : status === 'RESOLVED'
        ? 'border-slate-200 bg-gradient-to-br from-emerald-50/10 to-white'
        : 'border-slate-200'
    }`}>
      <div>
        {/* Top Header: Category & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {complaint.category}
            </span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Supplier & Warehouse */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base md:text-lg">
            <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{complaint.supplierName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-xs md:text-sm">
            <Warehouse className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{complaint.warehouseName}</span>
          </div>
        </div>

        {/* Description preview */}
        <p 
          onClick={() => onViewDetails(complaint)} 
          className="text-slate-600 text-xs md:text-sm line-clamp-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          {complaint.description}
        </p>

        {/* Dates & Timeline grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3 bg-white p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Received: <strong className="text-slate-700">{formatDateSafe(complaint.dateSentToUs)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Sent: <strong className="text-slate-700">{formatDateSafe(complaint.dateSentToSupplier)}</strong></span>
          </div>
          {complaint.dateResponseReceived && (
            <div className="col-span-2 flex items-center gap-1.5 text-emerald-700 pt-1 border-t border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Response: <strong>{formatDateSafe(complaint.dateResponseReceived)}</strong></span>
            </div>
          )}
        </div>

        {/* User Audit Trail Info */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mb-3 px-1">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>Logged by <strong className="text-slate-600 font-medium">{complaint.createdBy || 'Team Member'}</strong></span>
          </div>
          {complaint.resolvedBy && status === 'RESOLVED' && (
            <div className="flex items-center gap-1 text-emerald-700">
              <UserCheck className="w-3 h-3 text-emerald-600" />
              <span>Resolved by <strong className="font-medium">{complaint.resolvedBy}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-auto">
        <button
          type="button"
          onClick={() => onViewDetails(complaint)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Details
        </button>

        <div className="flex items-center gap-2">
          {status !== 'RESOLVED' && (
            <button
              type="button"
              onClick={() => onQuickResolve(complaint)}
              title="Mark as Resolved Today"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resolve</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(complaint)}
            title="Edit Complaint"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(complaint.id)}
            title="Delete Complaint"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
