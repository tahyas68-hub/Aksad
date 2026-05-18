import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Printer, Download, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { downloadExcel } from '../lib/excel';

export default function ContractDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contracts, customers, products, updateInstallmentPayment, archiveContract, deleteContract } = useAppStore();
  
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const contract = contracts.find(c => c.id === id);
  if (!contract) return <div className="p-4 text-center">العقد غير موجود</div>;

  const customer = customers.find(c => c.id === contract.customerId);
  const product = products.find(p => p.id === contract.productId);

  const handlePayment = () => {
    if (!selectedInstallment || !paymentAmount) return;
    updateInstallmentPayment(contract.id, selectedInstallment.id, parseFloat(paymentAmount));
    setSelectedInstallment(null);
    setPaymentAmount('');
  };

  const handleExport = () => {
    const data = contract.installments.map(i => ({
      No: i.number,
      DueDate: format(new Date(i.dueDate), 'yyyy-MM-dd'),
      Amount: i.amount,
      Paid: i.paidAmount,
      Remaining: i.amount - i.paidAmount,
      Status: i.status === 'paid' ? 'مدفوع' : i.status
    }));
    downloadExcel(data, `Contract_${contract.id.substring(0,8)}`);
  };

  return (
    <div className="space-y-6 pb-6">
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
        <ArrowLeft className="w-4 h-4 ml-2 mr-0" /> رجوع
       </button>

       <Card className="!bg-indigo-600 text-white relative overflow-hidden border-0">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <CheckCircle className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-indigo-200 text-xs uppercase tracking-wider mb-1">العميل</div>
                <div className="text-xl font-bold">{customer?.name}</div>
              </div>
              <Badge variant={contract.status === 'completed' ? 'success' : contract.status === 'archived' ? 'neutral' : 'info'}>
                {contract.status === 'completed' ? 'مكتمل' : contract.status === 'archived' ? 'مؤرشف' : 'نشط'}
              </Badge>
            </div>
            
            <div>
              <div className="text-indigo-200 text-xs uppercase tracking-wider mb-1">المنتج</div>
              <div className="text-lg font-medium">{product?.name}</div>
            </div>
          </div>
       </Card>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40">
          <div className="text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">المبلغ الإجمالي</div>
          <div className="font-bold text-indigo-900 dark:text-indigo-100 text-xl">{formatCurrency(contract.totalAmount)}</div>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/40">
          <div className="text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">المتبقي</div>
          <div className="font-bold text-rose-900 dark:text-rose-100 text-xl">{formatCurrency(contract.remainingAmount)}</div>
        </Card>
      </div>

       {!isCustomer && (
         <div className="flex gap-2">
           {contract.status === 'completed' && (
             <Button variant="outline" className="flex-1" onClick={() => { archiveContract(contract.id); }}>
               أرشفة العقد
             </Button>
           )}
           <Button variant="danger" className="flex-1" onClick={() => { 
             if(confirm('هل أنت متأكد من حذف هذا العقد نهائياً؟')) {
               deleteContract(contract.id);
               navigate('/contracts');
             }
           }}>
             <Trash2 className="w-4 h-4 ml-2" /> حذف
           </Button>
           <Button variant="secondary" className="flex-1">
             <Printer className="w-4 h-4 mr-2 ml-0" /> طباعة
           </Button>
           <Button variant="outline" onClick={handleExport}>
             <Download className="w-4 h-4 mr-2 ml-0" /> تصدير
           </Button>
         </div>
       )}

       {isCustomer && (
         <div className="flex gap-2">
           <Button variant="secondary" className="flex-1">
             <Printer className="w-4 h-4 mr-2 ml-0" /> طباعة
           </Button>
           <Button variant="outline" onClick={handleExport}>
             <Download className="w-4 h-4 mr-2 ml-0" /> تصدير الدفعات
           </Button>
         </div>
       )}

       <div>
         <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">جدول الدفعات</h3>
         <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3">رقم</th>
                    <th className="px-4 py-3">تاريخ الاستحقاق</th>
                    <th className="px-4 py-3 text-left">المبلغ</th>
                    <th className="px-4 py-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {contract.installments.map((inst) => {
                    const isLate = inst.status !== 'paid' && isPast(new Date(inst.dueDate)) && !isToday(new Date(inst.dueDate));
                    return (
                      <tr 
                        key={inst.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!isCustomer && inst.status !== 'paid' ? 'cursor-pointer' : ''} ${isLate ? 'bg-rose-50/50 dark:bg-rose-900/20' : ''}`}
                        onClick={() => {
                          if (!isCustomer && inst.status !== 'paid') {
                            setSelectedInstallment(inst);
                            setPaymentAmount((inst.amount - inst.paidAmount).toFixed(2));
                          }
                        }}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">#{inst.number}</td>
                        <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${isLate ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}`}>
                          {format(new Date(inst.dueDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-left">
                           <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(inst.amount)}</div>
                           {inst.paidAmount > 0 && inst.status !== 'paid' && (
                             <div className="text-xs text-indigo-600 dark:text-indigo-400">المدفوع: {formatCurrency(inst.paidAmount)}</div>
                           )}
                        </td>
                        <td className="px-4 py-3 text-center">
                           <Badge variant={inst.status === 'paid' ? 'success' : isLate ? 'danger' : 'warning'}>
                             {inst.status === 'paid' ? 'مدفوع' : isLate ? 'متأخر' : 'قيد الانتظار'}
                           </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
         </div>
       </div>

       <Modal isOpen={!!selectedInstallment} onClose={() => setSelectedInstallment(null)} title="تحصيل دفعة">
          {selectedInstallment && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-4 text-gray-900 dark:text-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 dark:text-gray-400">الدفعة رقم {selectedInstallment.number}</span>
                  <span className="font-medium">{format(new Date(selectedInstallment.dueDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span>المبلغ المستهدف</span>
                  <span>{formatCurrency(selectedInstallment.amount)}</span>
                </div>
              </div>
              <Input 
                label="مبلغ الدفعة" 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
              />
              <Button fullWidth onClick={handlePayment} className="mt-2">
                تأكيد الدفع
              </Button>
            </div>
          )}
       </Modal>
    </div>
  );
}
