/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/Dashboard';
import InventoryPage from './pages/Inventory';
import CustomersPage from './pages/Customers';
import CustomerDetailsPage from './pages/CustomerDetails';
import ContractsPage from './pages/Contracts';
import ContractDetailsPage from './pages/ContractDetails';
import ReportsPage from './pages/Reports';
import NotificationsPage from './pages/Notifications';
import SettingsPage from './pages/Settings';
import { useAppStore } from './stores/useAppStore';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { products, addProduct, customers, addCustomer, addNotification, theme } = useAppStore();

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Seed initial data if empty
    if (products.length === 0) {
      addProduct({ name: 'آيفون 15 برو ماكس', price: 2100000, stock: 15, category: 'إلكترونيات' });
      addProduct({ name: 'شاشة سامسونج ذكية 4K', price: 1200000, stock: 8, category: 'أجهزة منزلية' });
      addProduct({ name: 'ماك بوك إير M3', price: 1800000, stock: 5, category: 'إلكترونيات' });
    }
    if (customers.length === 0) {
      addCustomer({ name: 'أحمد علي', phone: '+964 770 123 4567', address: 'بغداد، العراق' });
      addCustomer({ name: 'سارة سميث', phone: '+964 780 987 6543', address: 'أربيل، العراق' });
      
      // Mock notifications
      addNotification({ title: 'تسجيل عميل جديد', message: 'تمت إضافة سارة سميث إلى النظام.', type: 'payment' });
      addNotification({ title: 'تنبيه دفع متأخر', message: 'تأخر محمد 3 أيام عن سداد العقد رقم 1024', type: 'late' });
    }
  }, []);

  return children;
}

export default function App() {
  return (
    <AppInitializer>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="contracts/:id" element={<ContractDetailsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppInitializer>
  );
}
