import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../UI/Toast';
import { SettingsModal } from '../Forms/SettingsModal';
import { ChangeCredentialsModal } from '../Forms/ChangeCredentialsModal';
import { getScriptUrl, api } from '../../services/api';

export const Layout = ({ children, currentUser, onLogout, onUserUpdated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changeCredsOpen, setChangeCredsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState(Boolean(getScriptUrl()));
  const [lowStockCount, setLowStockCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('moshaga_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem('moshaga_theme', darkMode ? 'dark' : 'light'); } catch (e) {}
  }, [darkMode]);

  const showToast = ({ type, message }) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const updateConnectionState = () => {
    setIsGoogleSheetsConnected(Boolean(getScriptUrl()));
  };

  // Fetch low stock count for sidebar badge
  const refreshLowStockCount = async () => {
    try {
      const inv = await api.getInventory();
      if (inv) {
        const count = inv.filter(i => (Number(i.currentQuantity) || 0) <= (Number(i.minimumStock) || 0)).length;
        setLowStockCount(count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshLowStockCount();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar navigation */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        lowStockCount={lowStockCount}
      />

      {/* Main content view */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header 
          onOpenSidebar={() => setSidebarOpen(true)}
          isGoogleSheetsConnected={isGoogleSheetsConnected}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenChangeCredentials={() => setChangeCredsOpen(true)}
          currentUser={currentUser}
          onLogout={onLogout}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((v) => !v)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {typeof children === 'function' 
            ? children({ showToast, refreshLowStockCount }) 
            : React.cloneElement(children, { showToast, refreshLowStockCount })}
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Settings / Google Sheets Connection Modal */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUrlUpdated={updateConnectionState}
        showToast={showToast}
      />

      {/* Change Password / Username Modal */}
      <ChangeCredentialsModal
        isOpen={changeCredsOpen}
        onClose={() => setChangeCredsOpen(false)}
        currentUser={currentUser}
        onUpdated={(updated) => {
          if (onUserUpdated) onUserUpdated(updated);
        }}
        showToast={showToast}
      />
    </div>
  );
};
