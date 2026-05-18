import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, ChevronRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export default function ContractsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { contracts, customers, products, createContract, deleteContract, currentUser } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Contract Form State
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [installmentType, setInstallmentType] = useState<'daily'|'weekly'|'monthly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setIsModalOpen(true);
      // Clear state so it doesn't reopen continuously
      window.history.replaceState({}, '');
    }
  }, [location]);

  // Derived state for selected product to auto-fill price
  useEffect(() => {
    if (productId) {
      const p = products.find(p => p.id === productId);
      if (p) setTotalAmount(p.price.toString());
    }
  }, [productId, products]);

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  const filteredContracts = contracts.filter(c => 
    c.status === tab && 
    (customers.find(cust => cust.id === c.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     products.find(p => p.id === c.productId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = () => {
    if (!customerId || !productId || !totalAmount || !downPayment || !installmentsCount || !startDate) return;
    
    createContract({
      customerId,
      productId,
      totalAmount: parseFloat(totalAmount),
      downPayment: parseFloat(downPayment),
      installmentType,
      installmentsCount: parseInt(installmentsCount),
      startDate
    });
    
    setIsModalOpen(false);
    // Reset form
    setCustomerId(''); setProductId(''); setTotalAmount(''); setDownPayment(''); setInstallmentsCount(''); setInstallmentType('monthly');
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsModalOpen(true)} fullWidth>
        <Plus className="w-5 h-5 mr-2 ml-0" /> عقد جديد
      </Button>

      <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-full relative">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === 'active' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setTab('active')}
        >
          النشطة
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${tab === 'archived' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          onClick={() => setTab('archived')}
        >
          المؤرشفة
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          className="pr-10 text-right" 
          placeholder="ابحث عن العقود..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3 mt-4">
        {filteredContracts.map(contract => {
          const customer = customers.find(c => c.id === contract.customerId);
          const product = products.find(p => p.id === contract.productId);
          
          return (
            <Card key={contract.id} className="relative !p-0 overflow-hidden group cursor-pointer" onClick={() => navigate(`/contracts/${contract.id}`)}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{customer?.name}</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{product?.name}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>
                
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(confirm('هل تريد حذف العقد نهائياً؟')) deleteContract(contract.id); 
                    }} 
                    className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-gray-800 shadow-sm rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-xs font-medium">{contract.installmentType === 'daily' ? 'يومي' : contract.installmentType === 'weekly' ? 'أسبوعي' : 'شهري'}</span>
                  <span>{contract.installmentsCount} دفعات</span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-gray-50 dark:border-gray-800/50 pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">الإجمالي</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contract.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">المتبقي</div>
                    <div className="font-medium text-rose-600 dark:text-rose-400">{formatCurrency(contract.remainingAmount)}</div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredContracts.length === 0 && (
          <div className="text-center py-12 text-gray-400">لم يتم العثور على عقود</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء عقد">
        <div className="space-y-4">
          <Select label="العميل" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">اختر عميل</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <Select label="المنتج" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">اختر منتج</option>
            {products.filter(p => p.status === 'available').map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="المبلغ الإجمالي" type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
            <Input label="الدفعة المقدمة" type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Select label="التكرار" value={installmentType} onChange={(e) => setInstallmentType(e.target.value as any)}>
               <option value="daily">يومي</option>
               <option value="weekly">أسبوعي</option>
               <option value="monthly">شهري</option>
            </Select>
            <Input label="عدد الدفعات" type="number" value={installmentsCount} onChange={(e) => setInstallmentsCount(e.target.value)} />
          </div>

          <Input label="تاريخ البدء" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          {/* Auto-calculated preview */}
          {totalAmount && downPayment && installmentsCount && parseInt(installmentsCount) > 0 && (
             <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex justify-between items-center text-sm mt-2">
                <span className="text-indigo-800 dark:text-indigo-200">مبلغ الدفعة:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400">
                  {formatCurrency((parseFloat(totalAmount) - parseFloat(downPayment)) / parseInt(installmentsCount))} / {installmentType === 'daily' ? 'يومي' : installmentType === 'weekly' ? 'أسبوعي' : 'شهري'}
                </span>
             </div>
          )}

          <Button fullWidth onClick={handleCreate} className="mt-4">
            إنشاء عقد
          </Button>
        </div>
      </Modal>
    </div>
  );
}
