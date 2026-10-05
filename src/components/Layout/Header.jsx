import React from 'react';
import { Menu, Sheet, Plus, Calendar, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

export const Header = ({ onOpenSidebar, isGoogleSheetsConnected, onOpenSettings, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Manager Dashboard';
      case '/daily-sales': return 'Daily Sales Recording';
      case '/sales-history': return 'Sales History & Records';
      case '/products': return 'Drink Products & Pricing';
      case '/inventory': return 'Inventory & Ingredients';
      case '/expenses': return 'Expense Management';
      case '/reports': return 'Business Analysis & Reports';
      case '/sheets-setup': return 'Google Sheets API Setup';
      default: return 'moshaga Cafe Manager';
    }
  };

  const todayStr = formatDate(new Date().toISOString());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: mobile toggle + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h2>
            <p className="text-xs font-medium text-slate-500 hidden sm:flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>Today: {todayStr}</span>
            </p>
          </div>
        </div>

        {/* Right side: Google Sheets indicator + Record Daily Sales shortcut button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection status badge */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
              isGoogleSheetsConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
            title="Click to manage Google Sheets API connection"
          >
            <Sheet className="w-4 h-4" />
            <span className="hidden md:inline">
              {isGoogleSheetsConnected ? 'Google Sheet Connected' : 'Backend Not Connected'}
            </span>
            {isGoogleSheetsConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            )}
          </button>

          {/* Current user + logout */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <span className="max-w-24 truncate">{currentUser?.username || 'User'}</span>
            {currentUser?.role && <span className="text-slate-400">•</span>}
            {currentUser?.role && <span>{currentUser.role}</span>}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Quick Record Sales button */}
          <button
            onClick={() => navigate('/daily-sales')}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Record Daily Sales</span>
            <span className="sm:hidden">Sales</span>
          </button>
        </div>
      </div>
    </header>
  );
};
