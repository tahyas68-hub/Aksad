import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../lib/utils';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function PaymentTimelinePage() {
  const { contracts, products, currentUser } = useAppStore();

  if (currentUser?.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  const myContracts = contracts.filter(c => c.customerId === currentUser.id);

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">الجدول الزمني للدفعات</h2>
        <p className="text-sm text-slate-500">تتبع جميع الدفعات السابقة والقادمة</p>
      </div>

      <div className="space-y-6">
        {myContracts.map(contract => {
          const product = products.find(p => p.id === contract.productId);

          return (
            <Card key={contract.id} className="p-4 border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">
                عقد: {product?.name || 'منتج غير معروف'}
              </h3>
              
              <div className="relative border-r-2 border-slate-200 dark:border-slate-700 mr-2 pr-6 pb-2 space-y-4">
                {contract.installments.map((inst, index) => {
                  const isPaid = inst.status === 'paid';
                  const isLate = inst.status === 'late';
                  const Icon = isPaid ? CheckCircle2 : (isLate ? Clock : Circle);
                  
                  return (
                    <div key={inst.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -right-[35px] top-1 bg-white dark:bg-slate-900 ${
                        isPaid ? 'text-emerald-500' : isLate ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600'
                      }`}>
                        <Icon className="w-6 h-6 bg-white dark:bg-slate-900" />
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            الدفعة #{inst.number}
                          </div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {formatCurrency(inst.amount)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-slate-500">
                            استحقاق: {format(new Date(inst.dueDate), 'yyyy/MM/dd')}
                          </div>
                          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                            isLate ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                            'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {isPaid ? 'تم الدفع ' + formatCurrency(inst.paidAmount) : isLate ? 'متأخر' : 'قيد الانتظار'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
        {myContracts.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            لا توجد دفعات حالية
          </div>
        )}
      </div>
    </div>
  );
}
