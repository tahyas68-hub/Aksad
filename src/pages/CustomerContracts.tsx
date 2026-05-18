import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { FileText, Calendar, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Navigate, Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function CustomerContractsPage() {
  const { contracts, products, currentUser } = useAppStore();

  if (currentUser?.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  const myContracts = contracts.filter(c => c.customerId === currentUser.id);

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">عقودي وإقساطي</h2>
        <p className="text-sm text-slate-500">متابعة حالة العقود والدفعات الحالية</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myContracts.map(contract => {
          const product = products.find(p => p.id === contract.productId);
          const nextInstallment = contract.installments.find(i => i.status === 'pending');

          return (
            <Link key={contract.id} to={`/contracts/${contract.id}`}>
              <Card className="overflow-hidden border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">رقم العقد</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-sm">#{contract.id.split('-')[0]}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    contract.status === 'active' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30' :
                    contract.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800'
                  }`}>
                    {contract.status === 'active' ? 'نشط' : contract.status === 'completed' ? 'مكتمل' : 'مؤرشف'}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{product?.name || 'منتج غير معروف'}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {contract.installmentsCount} أقساط • {contract.installmentType === 'daily' ? 'يومي' : contract.installmentType === 'weekly' ? 'أسبوعي' : 'شهري'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">إجمالي المبلغ</div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(contract.totalAmount)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">المبلغ المتبقي</div>
                      <div className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(contract.remainingAmount)}</div>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${((contract.totalAmount - contract.remainingAmount) / contract.totalAmount) * 100}%` }}
                    />
                  </div>

                  {nextInstallment && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 text-sm">
                        <Calendar className="w-4 h-4" /> القسط القادم
                      </div>
                      <div className="font-bold text-amber-700 dark:text-amber-400">
                        {format(new Date(nextInstallment.dueDate), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
        {myContracts.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            لا توجد عقود حالية
          </div>
        )}
      </div>
    </div>
  );
}
