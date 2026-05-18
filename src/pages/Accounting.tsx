import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Navigate, useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Clock, AlertTriangle, FileText, ArrowUpRight, ArrowDownRight, Package, Receipt, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

export default function AccountingPage() {
  const { contracts, payments, products, expenses, currentUser } = useAppStore();
  const navigate = useNavigate();

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  // Basic calculations
  const totalSalesRevenue = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  
  // Purchase costs for sold products
  let totalPurchaseCost = 0;
  contracts.forEach(contract => {
    const product = products.find(p => p.id === contract.productId);
    if (product?.purchasePrice) {
      totalPurchaseCost += product.purchasePrice;
    }
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const grossProfit = totalSalesRevenue - totalPurchaseCost;
  const netProfit = grossProfit - totalExpenses;

  // Breakdown of collections
  const cashSales = contracts.filter(c => c.downPayment >= c.totalAmount).reduce((sum, c) => sum + c.totalAmount, 0);
  const downPaymentsFromInstallments = contracts.filter(c => c.downPayment < c.totalAmount).reduce((sum, c) => sum + c.downPayment, 0);
  
  // Installment collections
  const dailyInstallmentCollections = payments.filter(p => {
    const contract = contracts.find(c => c.id === p.contractId);
    return contract?.installmentType === 'daily';
  }).reduce((sum, p) => sum + p.amount, 0);

  const weeklyInstallmentCollections = payments.filter(p => {
    const contract = contracts.find(c => c.id === p.contractId);
    return contract?.installmentType === 'weekly';
  }).reduce((sum, p) => sum + p.amount, 0);

  const monthlyInstallmentCollections = payments.filter(p => {
    const contract = contracts.find(c => c.id === p.contractId);
    return contract?.installmentType === 'monthly';
  }).reduce((sum, p) => sum + p.amount, 0);

  const totalInstallmentCollections = dailyInstallmentCollections + weeklyInstallmentCollections + monthlyInstallmentCollections;
  const totalCollected = cashSales + downPaymentsFromInstallments + totalInstallmentCollections;
  
  const outstandingBalances = totalSalesRevenue - totalCollected;

  const allInstallments = contracts.flatMap(c => c.installments);
  const overdueInstallments = allInstallments.filter(i => i.status === 'late' || (i.status === 'pending' && new Date(i.dueDate) < new Date()));
  const overduePaymentsAmount = overdueInstallments.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);

  const StatCard = ({ title, value, icon, color, bgInfo }: any) => (
    <Card className={`relative overflow-hidden p-5 border-none shadow-lg ${bgInfo} text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/80 font-medium text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{formatCurrency(value)}</h3>
        </div>
        <div className={`p-2 rounded-xl bg-white/20 backdrop-blur-sm`}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
    </Card>
  );

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">اللوحة المالية</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">إدارة الإيرادات والمصروفات والأرباح</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="إجمالي إيرادات المبيعات" 
          value={totalSalesRevenue} 
          icon={<TrendingUp className="w-6 h-6" />} 
          bgInfo="bg-gradient-to-br from-indigo-500 to-purple-600" 
        />
        <StatCard 
          title="المتحصلات النقدية" 
          value={totalCollected} 
          icon={<Wallet className="w-6 h-6" />} 
          bgInfo="bg-gradient-to-br from-emerald-400 to-emerald-600" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="إجمالي المصروفات" 
          value={totalExpenses} 
          icon={<TrendingDown className="w-6 h-6" />} 
          bgInfo="bg-gradient-to-br from-rose-400 to-rose-600" 
        />
        <StatCard 
          title="صافي الربح" 
          value={netProfit} 
          icon={<DollarSign className="w-6 h-6" />} 
          bgInfo="bg-gradient-to-br from-blue-400 to-blue-600" 
        />
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-4">تفاصيل المتحصلات</h3>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">مبيعات الكاش والـمُقدم</p>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(cashSales + downPaymentsFromInstallments)}</p>
        </Card>
        
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">أقساط يومية</p>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(dailyInstallmentCollections)}</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">أقساط أسبوعية</p>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(weeklyInstallmentCollections)}</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-purple-500 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">أقساط شهرية</p>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyInstallmentCollections)}</p>
        </Card>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-4">الأرصدة والديون</h3>
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="أرصدة غير محصلة" 
          value={outstandingBalances} 
          icon={<FileText className="w-6 h-6" />} 
          bgInfo="bg-gradient-to-br from-amber-400 to-orange-500" 
        />
        <StatCard 
          title="دفعات متأخرة" 
          value={overduePaymentsAmount} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          bgInfo="bg-gradient-to-br from-rose-500 to-rose-700" 
        />
      </div>

      <div className="mt-8">
        <button 
          onClick={() => navigate('/expenses')}
          className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingDown className="w-5 h-5" />
          إدارة المصروفات التشغيلية
        </button>
      </div>
    </div>
  );
}
