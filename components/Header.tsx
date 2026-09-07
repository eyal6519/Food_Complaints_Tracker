'use client';

import React from 'react';
import { SafeUser } from '@/types/complaint';
import { Plus, Download, LogOut, UtensilsCrossed, Users, User } from 'lucide-react';

interface HeaderProps {
  currentUser: SafeUser | null;
  onNewComplaint: () => void;
  onExportCsv: () => void;
  onLogout: () => void;
  onOpenTeamModal: () => void;
  isExporting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNewComplaint,
  onExportCsv,
  onLogout,
  onOpenTeamModal,
  isExporting
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Food QA Complaints
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Warehouse to Supplier Process Tracker
            </p>
          </div>
        </div>

        {/* Actions & User Info */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Team Members Button */}
          <button
            onClick={onOpenTeamModal}
            title="Manage Team Members"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl border border-slate-200/80 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Team</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            disabled={isExporting}
            title="Export to CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl border border-slate-200/80 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          {/* New Complaint */}
          <button
            onClick={onNewComplaint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Complaint</span>
          </button>

          {/* User Profile Badge */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                {currentUser.name[0]?.toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-slate-800 truncate max-w-[100px]">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400">@{currentUser.username}</div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
