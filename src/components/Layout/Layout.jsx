import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../UI/Toast';
import { SettingsModal } from '../Forms/SettingsModal';
import { getScriptUrl, api } from '../../services/api';

export const Layout = ({ children, currentUser, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState(Boolean(getScriptUrl()));
  const [lowStockCount, setLowStockCount] = useState(0);

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
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
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
          currentUser={currentUser}
          onLogout={onLogout}
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
    </div>
  );
};
