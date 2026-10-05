import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Coffee,
  CalendarPlus,
  History,
  Boxes,
  Receipt,
  BarChart3,
  Sheet,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, lowStockCount = 0 }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Daily Sales', path: '/daily-sales', icon: CalendarPlus },
    { label: 'Sales History', path: '/sales-history', icon: History },
    { label: 'Products', path: '/products', icon: Coffee },
    { 
      label: 'Inventory', 
      path: '/inventory', 
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-600 text-white'
    },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Google Sheets API', path: '/sheets-setup', icon: Sheet },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand logo header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-900/20">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide text-white leading-none">moshaga</h1>
              <p className="text-[11px] font-semibold tracking-wider text-amber-500 uppercase mt-1">Cafe Manager</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                  ${isActive 
                    ? 'bg-amber-700/90 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between font-medium text-slate-300">
            <span>Business Control System</span>
            <span className="text-[10px] bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded border border-amber-700/40">Manager Only</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">v1.0 • Non-POS Cafe Operating System</p>
        </div>
      </aside>
    </>
  );
};
