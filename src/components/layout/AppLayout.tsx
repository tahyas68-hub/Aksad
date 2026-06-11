import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Users, FileText, PieChart, Bell, Settings, ShieldCheck, History, DollarSign, Wallet } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';

export default function AppLayout() {
  const location = useLocation();
  const { notifications, currentUser } = useAppStore();
  const myNotifications = notifications.filter(n => {
    if (currentUser?.role === 'customer') {
      const matchingCustomer = useAppStore.getState().customers.find(c => c.phone === currentUser.username || c.id === currentUser.id);
      return n.customerId === matchingCustomer?.id;
    }
    return true; // Admin/merchant see everything
  });
  const unreadNotifications = myNotifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'الرئيسية';
      case '/inventory': return 'المخزون';
      case '/products': return 'المنتجات';
      case '/customers': return 'العملاء';
      case '/users': return 'المستخدمين';
      case '/contracts': return 'العقود';
      case '/my-contracts': return 'عقودي';
      case '/reports': return 'التقارير';
      case '/installments': return 'الأقساط';
      case '/accounting': return 'المالية';
      case '/expenses': return 'المصروفات';
      case '/notifications': return 'الإشعارات';
      case '/settings': return 'الإعدادات';
      default: 
        if (location.pathname.startsWith('/contracts/')) return 'تفاصيل العقد';
        if (location.pathname.startsWith('/customers/')) return 'تفاصيل العميل';
        return 'النظام';
    }
  };

  const role = currentUser?.role || 'merchant';

  return (
    <div className="flex flex-col h-screen bg-[#f3f5e9] dark:bg-[#1f241a] text-gray-900 dark:text-gray-100 w-full overflow-hidden max-w-md mx-auto relative shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
        <div className="flex items-center gap-3">
          <NavLink to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            )}
          </NavLink>
          <NavLink to="/settings" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </NavLink>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 p-4 scroll-smooth">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 mt-auto w-full max-w-md bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16">
          <NavItem to="/" icon={<Home className="w-6 h-6" />} label="الرئيسية" />
          
          {role === 'admin' && (
            <>
              <NavItem to="/users" icon={<ShieldCheck className="w-6 h-6" />} label="المستخدمين" />
              <NavItem to="/contracts" icon={<FileText className="w-6 h-6" />} label="العقود" />
              <NavItem to="/accounting" icon={<Wallet className="w-6 h-6" />} label="المالية" />
              <NavItem to="/reports" icon={<PieChart className="w-6 h-6" />} label="التقارير" />
            </>
          )}

          {role === 'merchant' && (
            <>
              <NavItem to="/inventory" icon={<Package className="w-6 h-6" />} label="المخزون" />
              <NavItem to="/customers" icon={<Users className="w-6 h-6" />} label="العملاء" />
              <NavItem to="/contracts" icon={<FileText className="w-6 h-6" />} label="العقود" />
              <NavItem to="/accounting" icon={<Wallet className="w-6 h-6" />} label="المالية" />
            </>
          )}

          {role === 'customer' && (
            <>
              <NavItem to="/products" icon={<Package className="w-6 h-6" />} label="المنتجات" />
              <NavItem to="/my-contracts" icon={<FileText className="w-6 h-6" />} label="عقودي" />
              <NavItem to="/payment-timeline" icon={<History className="w-6 h-6" />} label="سجل الدفعات" />
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
          isActive ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn("transition-transform duration-200", isActive && "scale-110")}>
            {icon}
          </div>
          <span className="text-[10px] uppercase tracking-wider">{label}</span>
        </>
      )}
    </NavLink>
  );
}
