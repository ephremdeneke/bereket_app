import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { DailySales } from './pages/DailySales';
import { SalesHistory } from './pages/SalesHistory';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { AppsScriptSetup } from './pages/AppsScriptSetup';
import { Login } from './pages/Login';
import { getCurrentUser, logout } from './utils/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <Router>
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        {({ showToast, refreshLowStockCount }) => (
          <Routes>
            <Route path="/" element={<Dashboard showToast={showToast} />} />
            <Route path="/daily-sales" element={<DailySales showToast={showToast} />} />
            <Route path="/sales-history" element={<SalesHistory showToast={showToast} />} />
            <Route path="/products" element={<Products showToast={showToast} />} />
            <Route path="/inventory" element={<Inventory showToast={showToast} refreshLowStockCount={refreshLowStockCount} />} />
            <Route path="/expenses" element={<Expenses showToast={showToast} />} />
            <Route path="/reports" element={<Reports showToast={showToast} />} />
            <Route path="/sheets-setup" element={<AppsScriptSetup showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Layout>
    </Router>
  );
}
