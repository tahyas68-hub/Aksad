import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Navigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit2, TrendingDown, Calendar, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Expense } from '../types';

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, currentUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddMode, setIsAddMode] = useState(false);
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    title: '',
    category: 'Operations',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
  });

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  const categories = [
    { id: 'Operations', label: 'عمليات تشغيلية' },
    { id: 'Salaries', label: 'رواتب موظفين' },
    { id: 'Maintenance', label: 'صيانة' },
    { id: 'Other', label: 'أخرى' }
  ];

  const handleSave = () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.date) {
      alert('يرجى تعبئة الحقول المطلوبة');
      return;
    }
    
    addExpense({
      title: newExpense.title!,
      category: newExpense.category!,
      amount: Number(newExpense.amount),
      date: newExpense.date!,
      paymentMethod: newExpense.paymentMethod
    });
    
    setIsAddMode(false);
    setNewExpense({
      title: '',
      category: 'Operations',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <TrendingDown className="w-6 h-6" />
          <h2 className="text-xl font-bold">المصروفات</h2>
        </div>
        <button 
          onClick={() => setIsAddMode(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {isAddMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">إضافة مصروف جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">البيان / العنوان</label>
                <Input 
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="مثال: فاتورة كهرباء"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المبلغ</label>
                  <Input 
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">التاريخ</label>
                  <Input 
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">التصنيف</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl outline-none px-4 py-3 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">طريقة الدفع</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl outline-none px-4 py-3 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    value={newExpense.paymentMethod}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                  >
                    <option value="cash">نقداً</option>
                    <option value="bank">تحويل بنكي</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white" onClick={handleSave}>حفظ</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsAddMode(false)}>إلغاء</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="بحث في المصروفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>
        <select
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-rose-500/20"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">الكل</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      {expenses.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
          <span className="text-sm font-bold text-rose-700 dark:text-rose-400">الإجمالي المفلتر</span>
          <span className="text-lg font-bold text-rose-700 dark:text-rose-400">{formatCurrency(totalFiltered)}</span>
        </div>
      )}

      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-base">{expense.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">
                    {categories.find(c => c.id === expense.category)?.label || expense.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">| {expense.paymentMethod === 'cash' ? 'نقدي' : 'بنكي'}</span>
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-rose-600 dark:text-rose-400 text-lg">{formatCurrency(expense.amount)}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(expense.date).toLocaleDateString('ar-SA')}</span>
              </div>
              <button 
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) deleteExpense(expense.id);
                }}
                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {filteredExpenses.length === 0 && (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">لا توجد مصروفات مسجلة</p>
          </div>
        )}
      </div>
    </div>
  );
}
