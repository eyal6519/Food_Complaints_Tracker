'use client';

import React from 'react';
import { Complaint, getComputedStatus, getDaysPending } from '@/types/complaint';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Hourglass, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Check,
  Building2,
  Warehouse
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ComplaintTableViewProps {
  complaints: Complaint[];
  onEdit: (complaint: Complaint) => void;
  onDelete: (id: string) => void;
  onQuickResolve: (complaint: Complaint) => void;
  onViewDetails: (complaint: Complaint) => void;
}

export const ComplaintTableView: React.FC<ComplaintTableViewProps> = ({
  complaints,
  onEdit,
  onDelete,
  onQuickResolve,
  onViewDetails
}) => {
  const formatDateSafe = (dStr: string | null | undefined) => {
    if (!dStr) return '-';
    try {
      return format(parseISO(dStr), 'dd MMM yyyy');
    } catch {
      return dStr;
    }
  };

  const renderStatusBadge = (complaint: Complaint) => {
    const status = getComputedStatus(complaint);
    const days = getDaysPending(complaint.dateSentToSupplier);

    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Overdue ({days}d)
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Hourglass className="w-3 h-3 text-amber-600" />
            Pending ({days}d)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Supplier & Warehouse</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Timeline (Sent / Resp)</th>
              <th className="py-3 px-4">Logged By</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {complaints.map((c) => {
              const status = getComputedStatus(c);

              return (
                <tr 
                  key={c.id} 
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(c)}
                >
                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(c)}
                  </td>

                  {/* Supplier & Warehouse */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">{c.supplierName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Warehouse className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{c.warehouseName}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60 inline-block truncate max-w-[160px]">
                      {c.category}
                    </span>
                  </td>

                  {/* Timeline */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    <div>Sent: <strong className="text-slate-800">{formatDateSafe(c.dateSentToSupplier)}</strong></div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {c.dateResponseReceived ? (
                        <span className="text-emerald-700 font-medium">Resp: {formatDateSafe(c.dateResponseReceived)}</span>
                      ) : (
                        <span className="italic">Awaiting response</span>
                      )}
                    </div>
                  </td>

                  {/* Logged By */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{c.createdBy || 'Team Member'}</div>
                    {c.resolvedBy && status === 'RESOLVED' && (
                      <div className="text-[10px] text-emerald-700">Resolved by {c.resolvedBy}</div>
                    )}
                  </td>

                  {/* Actions */}
                  <td 
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => onQuickResolve(c)}
                          title="Quick Resolve"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
                        >
                          Resolve
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onViewDetails(c)}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        title="Edit Record"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(c.id)}
                        title="Delete Record"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};
