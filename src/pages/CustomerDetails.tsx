import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, User, Phone, MapPin, Calendar, FileText, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, contracts, products, deleteCustomer, currentUser } = useAppStore();
  const [tab, setTab] = useState<'contracts' | 'history'>('contracts');

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  const customer = customers.find(c => c.id === id);
  if (!customer) return <div className="p-4 text-center">العميل غير موجود</div>;

  const customerContracts = contracts.filter(c => c.customerId === id);
  const getProduct = (pid: string) => products.find(p => p.id === pid);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
        <ArrowLeft className="w-4 h-4 ml-2 mr-0" /> الرجوع إلى العملاء
      </button>

      <Card className="!bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-0 relative">
        <button
          onClick={() => {
            if(confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
              deleteCustomer(customer.id);
              navigate('/customers');
            }
          }}
          className="absolute top-4 left-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
            {customer.name.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <div className="text-indigo-100 mt-1 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" /> تاريخ الانضمام {format(new Date(customer.createdAt), 'MMM yyyy')}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40">
          <div className="text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-4 h-4"/> الهاتف</div>
          <div className="font-bold text-blue-900 dark:text-blue-100 text-sm mt-2">{customer.phone}</div>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40">
          <div className="text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-4 h-4"/> العنوان</div>
          <div className="font-bold text-emerald-900 dark:text-emerald-100 text-sm mt-2 truncate">{customer.address || '-'}</div>
        </Card>
      </div>

      <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-full relative">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === 'contracts' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setTab('contracts')}
        >
          العقود
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setTab('history')}
        >
          سجل المدفوعات
        </button>
      </div>

      <div className="space-y-4">
        {tab === 'contracts' && (
          <>
            {customerContracts.length === 0 && (
              <div className="text-center py-12 text-gray-400">لم يتم العثور على عقود</div>
            )}
            {customerContracts.map(contract => {
              const product = getProduct(contract.productId);
              return (
                <Card 
                  key={contract.id} 
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  className={`border-0 ${contract.status === 'active' ? '!bg-indigo-50 dark:!bg-indigo-900/30' : contract.status === 'completed' ? '!bg-teal-50 dark:!bg-teal-900/30' : '!bg-gray-100 dark:!bg-gray-800'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{product?.name || 'منتج غير معروف'}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{format(new Date(contract.startDate), 'MMM dd, yyyy')}</div>
                    </div>
                    <Badge variant={contract.status === 'active' ? 'success' : contract.status === 'completed' ? 'info' : 'neutral'}>
                      {contract.status === 'active' ? 'نشط' : contract.status === 'completed' ? 'مكتمل' : contract.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                    <div>
                      <div className="text-xs text-gray-400">الإجمالي</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contract.totalAmount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">المتبقي</div>
                      <div className="font-medium text-rose-600 dark:text-rose-400">{formatCurrency(contract.remainingAmount)}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </>
        )}
        
        {tab === 'history' && (
          <div className="text-center py-12 text-gray-400">
            سيظهر سجل المدفوعات هنا.
          </div>
        )}
      </div>
    </div>
  );
}
