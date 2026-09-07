'use client';

import React from 'react';
import { Complaint, getComputedStatus } from '@/types/complaint';
import { AlertTriangle, Hourglass, CheckCircle2, Layers } from 'lucide-react';

interface StatsSummaryProps {
  complaints: Complaint[];
  activeFilter: 'ALL' | 'OVERDUE' | 'PENDING' | 'RESOLVED';
  onSelectFilter: (filter: 'ALL' | 'OVERDUE' | 'PENDING' | 'RESOLVED') => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  complaints,
  activeFilter,
  onSelectFilter
}) => {
  const total = complaints.length;
  let overdue = 0;
  let pending = 0;
  let resolved = 0;

  complaints.forEach((c) => {
    const s = getComputedStatus(c);
    if (s === 'OVERDUE') overdue++;
    else if (s === 'PENDING') pending++;
    else if (s === 'RESOLVED') resolved++;
  });

  const cards = [
    {
      id: 'ALL' as const,
      label: 'Total Filed',
      count: total,
      icon: Layers,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
      activeRing: 'ring-2 ring-slate-800 border-slate-800'
    },
    {
      id: 'OVERDUE' as const,
      label: 'Overdue (>14d)',
      count: overdue,
      icon: AlertTriangle,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      activeRing: 'ring-2 ring-rose-600 border-rose-600'
    },
    {
      id: 'PENDING' as const,
      label: 'Pending Response',
      count: pending,
      icon: Hourglass,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      activeRing: 'ring-2 ring-amber-600 border-amber-600'
    },
    {
      id: 'RESOLVED' as const,
      label: 'Resolved',
      count: resolved,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      activeRing: 'ring-2 ring-emerald-600 border-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;
        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            className={`p-3.5 sm:p-4 rounded-2xl bg-white border text-left transition-all duration-150 shadow-xs hover:shadow-md active:scale-98 ${
              isSelected ? card.activeRing : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{card.label}</span>
              <div className={`p-1.5 rounded-xl border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
};
