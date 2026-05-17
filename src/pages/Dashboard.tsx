import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Wallet, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { contracts, customers, payments } = useAppStore();

  const totalSales = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalCollected = contracts.reduce((sum, c) => sum + c.downPayment, 0) + payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalances = totalSales - totalCollected;
  
  const overdueInstallments = contracts.flatMap(c => c.installments).filter(i => i.status === 'late' || (i.status === 'pending' && new Date(i.dueDate) < new Date()));
  const totalOverdue = overdueInstallments.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);

  return (
    <div className="space-y-6 pb-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 !bg-indigo-600 text-white overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">إجمالي المحصل</span>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(totalCollected)}</div>
          </div>
        </Card>

        <Card className="flex flex-col gap-2 border-gray-100 dark:border-gray-800">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> المبيعات
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalSales)}</div>
        </Card>

        <Card className="flex flex-col gap-2 border-gray-100 dark:border-gray-800">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" /> المتأخرات
          </div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalOverdue)}</div>
        </Card>
      </div>

      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">إجراءات سريعة</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/contracts" state={{ openCreate: true }} className="block">
          <Card className="flex items-center justify-center p-6 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/50 border-indigo-100/50 dark:border-indigo-900/50">
            + بيع جديد
          </Card>
        </Link>
        <Link to="/contracts" className="block">
          <Card className="flex items-center justify-center p-6 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800">
            تحصيل دفعة
          </Card>
        </Link>
      </div>

      <div className="flex items-center justify-between pb-2 mt-8 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">العملاء الجدد</h2>
        <Link to="/customers" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">عرض الكل</Link>
      </div>

      <div className="space-y-3">
        {customers.slice(-3).reverse().map(customer => (
          <Card key={customer.id} className="!p-4 flex items-center justify-between border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                {customer.name.substring(0,2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{customer.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</div>
              </div>
            </div>
          </Card>
        ))}
        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-400">لا يوجد عملاء حتى الآن</div>
        )}
      </div>
    </div>
  );
}
