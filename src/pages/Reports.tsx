import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, TrendingUp, AlertTriangle, CheckCircle, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { downloadExcel } from '../lib/excel';
import { Navigate } from 'react-router-dom';

export default function ReportsPage() {
  const { contracts, payments, customers, currentUser } = useAppStore();

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  const totalSales = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalCollected = contracts.reduce((sum, c) => sum + c.downPayment, 0) + payments.reduce((sum, p) => sum + p.amount, 0);
  const totalRemaining = totalSales - totalCollected;

  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed' || c.status === 'archived').length;

  const allInstallments = contracts.flatMap(c => c.installments);
  const lateInstallments = allInstallments.filter(i => i.status === 'late' || (i.status === 'pending' && new Date(i.dueDate) < new Date()));
  const totalLateAmount = lateInstallments.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);

  const handleExport = () => {
    const reportData = [
      { Metric: 'Total Sales', Value: totalSales },
      { Metric: 'Total Collected', Value: totalCollected },
      { Metric: 'Remaining Balance', Value: totalRemaining },
      { Metric: 'Late Amount', Value: totalLateAmount },
      { Metric: 'Active Contracts', Value: activeContracts },
      { Metric: 'Completed Contracts', Value: completedContracts },
    ];
    downloadExcel(reportData, 'Financial_Report');
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl border border-transparent dark:border-indigo-900/50">
        <div className="flex items-center gap-3">
          <PieChartIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">نظرة مالية عامة</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">كل الوقت</div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2 ml-0" /> تصدير
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white !border-0 flex flex-col gap-1">
          <div className="text-gray-400 text-sm font-medium">إجمالي الإيرادات</div>
          <div className="text-3xl font-bold">{formatCurrency(totalSales)}</div>
        </Card>

        <Card className="flex flex-col gap-1 border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
             <TrendingUp className="w-3.5 h-3.5" /> تم تحصيله
           </div>
           <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalCollected)}</div>
        </Card>

        <Card className="flex flex-col gap-1 border-gray-100 dark:border-gray-800">
           <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
             <PieChartIcon className="w-3.5 h-3.5" /> قيد الانتظار
           </div>
           <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalRemaining)}</div>
        </Card>

        <Card className="col-span-2 flex items-center justify-between !border-rose-100 dark:!border-rose-900 !bg-rose-50/50 dark:!bg-rose-900/10">
           <div>
             <div className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">
               <AlertTriangle className="w-4 h-4" /> المدفوعات المتأخرة
             </div>
             <div className="text-sm text-gray-600 dark:text-gray-400">{lateInstallments.length} دفعات متأخرة</div>
           </div>
           <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalLateAmount)}</div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">حالة العقود</h3>
        <div className="space-y-3">
          <Card className="flex items-center justify-between !p-4 border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3">
               <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full text-blue-600 dark:text-blue-400"><TrendingUp className="w-5 h-5"/></div>
               <span className="font-medium text-gray-700 dark:text-gray-300">العقود النشطة</span>
             </div>
             <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{activeContracts}</span>
          </Card>
          <Card className="flex items-center justify-between !p-4 border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3">
               <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-5 h-5"/></div>
               <span className="font-medium text-gray-700 dark:text-gray-300">مكتملة</span>
             </div>
             <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{completedContracts}</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
