import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { Modal } from '../components/ui/Modal';
import { Navigate } from 'react-router-dom';

export default function InstallmentsPage() {
  const { contracts, customers, currentUser, updateInstallmentPayment } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  // Get all installments across all active contracts
  const allInstallments = contracts
    .filter(c => c.status === 'active')
    .flatMap(contract => {
      const customer = customers.find(cus => cus.id === contract.customerId);
      return contract.installments.map(inst => ({
        ...inst,
        contractId: contract.id,
        contractTotal: contract.totalAmount,
        contractRemaining: contract.remainingAmount,
        customerName: customer?.name || 'غير معروف',
      }));
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Filter based on search (customer name)
  const filteredInstallments = allInstallments.filter(inst => 
    inst.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.status.includes(searchQuery.toLowerCase())
  );

  const handlePaymentSubmit = () => {
    if (!selectedInstallment) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    if (amount > (selectedInstallment.amount - selectedInstallment.paidAmount)) {
      alert('المبلغ المدخل أكبر من المبلغ المتبقي للقسط');
      return;
    }

    updateInstallmentPayment(
      selectedInstallment.contractId,
      selectedInstallment.id,
      amount
    );
    
    setSelectedInstallment(null);
    setPaymentAmount('');
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'paid') return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold">مدفوع</span>;
    if (isPast(new Date(dueDate)) && !isToday(new Date(dueDate))) return <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-md text-xs font-bold">متأخر</span>;
    return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold">قيد الانتظار</span>;
  };

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <Clock className="w-6 h-6" />
          <h2 className="text-xl font-bold">استلام الأقساط</h2>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="ابحث باسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              <tr>
                <th className="px-4 py-3">العميل</th>
                <th className="px-4 py-3">رقم القسط</th>
                <th className="px-4 py-3">تاريخ الاستحقاق</th>
                <th className="px-4 py-3">المبلغ الكلي (للعقد)</th>
                <th className="px-4 py-3">مبلغ القسط</th>
                <th className="px-4 py-3">المبلغ الواصل (للقسط)</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInstallments.map((inst) => {
                const isLate = inst.status !== 'paid' && isPast(new Date(inst.dueDate)) && !isToday(new Date(inst.dueDate));
                return (
                  <tr key={`${inst.contractId}-${inst.id}`} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isLate ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {inst.customerName}
                    </td>
                    <td className="px-4 py-3">
                      #{inst.number}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {format(new Date(inst.dueDate), 'yyyy/MM/dd')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {formatCurrency(inst.contractTotal)}
                    </td>
                    <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-bold">
                      {formatCurrency(inst.amount)}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(inst.paidAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(inst.status, inst.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      {inst.status !== 'paid' ? (
                        <Button 
                          size="sm" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={() => {
                            setSelectedInstallment(inst);
                            setPaymentAmount((inst.amount - inst.paidAmount).toString());
                          }}
                        >
                          دفع القسط
                        </Button>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredInstallments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    لا توجد أقساط مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={!!selectedInstallment} 
        onClose={() => {
          setSelectedInstallment(null);
          setPaymentAmount('');
        }}
        title="استلام الدفعة"
      >
        {selectedInstallment && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">مبلغ القسط:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(selectedInstallment.amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">المدفوع سابقاً:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedInstallment.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm">المتبقي للقسط:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(selectedInstallment.amount - selectedInstallment.paidAmount)}</span>
              </div>
            </div>
            
            <Input 
              label="المبلغ المستلم" 
              type="number" 
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="text-lg font-bold"
            />
            
            <Button className="w-full h-12 text-lg mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={handlePaymentSubmit}>
              تأكيد الدفع
            </Button>
          </div>
        )}
      </Modal>

    </div>
  );
}
