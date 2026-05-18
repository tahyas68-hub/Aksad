import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Wallet, TrendingUp, Users, AlertCircle, Package, FileText, Database, Shield, Activity, Download, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { contracts, customers, payments, products, currentUser, users } = useAppStore();

  const role = currentUser?.role || 'merchant';

  // --- Customer Dashboard ---
  if (role === 'customer') {
    const customerContracts = contracts.filter(c => c.customerId === currentUser?.id);
    const myTotalAmount = customerContracts.reduce((sum, c) => sum + c.totalAmount, 0);
    const myRemaining = customerContracts.reduce((sum, c) => sum + c.remainingAmount, 0);
    const myPaid = myTotalAmount - myRemaining;

    return (
      <div className="space-y-6 pb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
          مرحباً، {currentUser?.name}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="col-span-2 !bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden relative shadow-lg shadow-indigo-600/20">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-100 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="font-medium text-sm">المتبقي للدفع</span>
              </div>
              <div className="text-3xl font-bold tracking-tight">{formatCurrency(myRemaining)}</div>
            </div>
          </Card>

          <Card className="flex flex-col gap-2 border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">إجمالي المشتريات</div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(myTotalAmount)}</div>
          </Card>

          <Card className="flex flex-col gap-2 border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">المدفوع</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(myPaid)}</div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link to="/products" className="block">
            <Card className="flex flex-col items-center justify-center p-6 gap-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-white dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                <Package className="w-6 h-6" />
              </div>
              تصفح المنتجات
            </Card>
          </Link>
          <Link to="/my-contracts" className="block">
            <Card className="flex flex-col items-center justify-center p-6 gap-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-white dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              عقودي وإقساطي
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // --- Admin & Merchant Common Data ---
  const totalSales = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalCollected = contracts.reduce((sum, c) => sum + c.downPayment, 0) + payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalances = totalSales - totalCollected;
  
  const allInstallments = contracts.flatMap(c => c.installments);
  const overdueInstallments = allInstallments.filter(i => i.status === 'late' || (i.status === 'pending' && new Date(i.dueDate) < new Date()));
  const totalOverdue = overdueInstallments.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
  const activeContracts = contracts.filter(c => c.status === 'active');

  // --- Admin Dashboard ---
  if (role === 'admin') {
    const merchantsCount = users.filter(u => u.role === 'merchant').length;
    
    return (
      <div className="space-y-6 pb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 p-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-900/30">
          <Shield className="w-5 h-5" />
          لوحة التحكم الإدارية
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
          <Card className="flex items-center gap-3 p-4 border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><Users className="w-5 h-5" /></div>
            <div>
              <div className="text-slate-500">التجار</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{merchantsCount}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4 border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"><Users className="w-5 h-5" /></div>
            <div>
              <div className="text-slate-500">العملاء</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{customers.length}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 backdrop-blur-sm">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><FileText className="w-5 h-5" /></div>
            <div>
              <div className="text-emerald-700 dark:text-emerald-400">عقود نشطة</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{activeContracts.length}</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4 border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 backdrop-blur-sm">
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"><AlertCircle className="w-5 h-5" /></div>
            <div>
              <div className="text-rose-700 dark:text-rose-400">أقساط متأخرة</div>
              <div className="text-xl font-bold text-rose-700 dark:text-rose-400 mt-0.5">{overdueInstallments.length}</div>
            </div>
          </Card>
        </div>

        <Card className="col-span-2 !bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-white overflow-hidden relative shadow-xl shadow-slate-900/10">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 p-2">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium text-sm">إجمالي الإيرادات (المحصلة)</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalCollected)}</div>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">إجراءات الإدارة</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/users" className="block">
              <ButtonWithIcon icon={<Users className="w-4 h-4"/>} text="المستخدمين" />
            </Link>
            <Link to="/settings" className="block">
              <ButtonWithIcon icon={<Database className="w-4 h-4 text-rose-500"/>} text="مسح البيانات" />
            </Link>
            <Link to="/reports" className="block col-span-2">
              <ButtonWithIcon icon={<Download className="w-4 h-4"/>} text="تصدير التقارير الشاملة" primary />
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>سجل النظام</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </h2>
          <div className="space-y-3 relative before:absolute before:inset-y-0 before:right-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
             {/* Mock Activity Logs array for UI demonstration */}
             {[
               {id: 1, text: 'تم تسجيل دخول المدير', time: 'منذ 5 دقائق', color: 'bg-emerald-500'},
               {id: 2, text: 'عقد جديد بواسطة أحمد التاجر', time: 'منذ ساعة', color: 'bg-blue-500'},
               {id: 3, text: 'دفعة محصلة: 50,000 د.ع', time: 'منذ ساعتين', color: 'bg-indigo-500'},
             ].map(log => (
               <div key={log.id} className="relative pl-4 pr-10">
                 <div className={`absolute right-[11px] top-1.5 w-2 h-2 rounded-full ring-4 ring-slate-50 dark:ring-slate-950 ${log.color}`}></div>
                 <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.text}</div>
                   <div className="text-xs text-slate-500 mt-1">{log.time}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    )
  }

  // --- Merchant Dashboard ---
  const paidInstallmentsCount = allInstallments.filter(i => i.status === 'paid').length;

  return (
    <div className="space-y-6 pb-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 !bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden relative shadow-lg shadow-indigo-600/20">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 p-1">
            <div className="flex items-center gap-2 text-indigo-100 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium text-sm">إجمالي المبيعات</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalSales)}</div>
          </div>
        </Card>

        <Card className="flex flex-col gap-2 p-4 border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-blue-500" /> الرصيد المتبقي
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(remainingBalances)}</div>
        </Card>

        <Card className="flex flex-col gap-2 p-4 border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500" /> المتأخرات
          </div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalOverdue)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
         <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{paidInstallmentsCount}</div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mt-1">أقساط مدفوعة</div>
         </div>
         <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <div className="text-xl font-bold text-rose-700 dark:text-rose-400">{overdueInstallments.length}</div>
            <div className="text-xs font-medium text-rose-600 dark:text-rose-500 mt-1">أقساط متأخرة</div>
         </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/contracts" state={{ openCreate: true }} className="block">
            <ButtonWithIcon icon={<Plus className="w-4 h-4"/>} text="عقد جديد" primary />
          </Link>
          <Link to="/inventory" state={{ openCreate: true }} className="block">
            <ButtonWithIcon icon={<Package className="w-4 h-4"/>} text="إضافة منتج" />
          </Link>
          <Link to="/customers" className="block">
            <ButtonWithIcon icon={<Users className="w-4 h-4"/>} text="العملاء" />
          </Link>
          <Link to="/contracts" className="block">
            <ButtonWithIcon icon={<Search className="w-4 h-4"/>} text="بحث العقود" />
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">أحدث العملاء</h2>
          <Link to="/customers" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">عرض الكل</Link>
        </div>
        <div className="space-y-3">
          {customers.slice(-3).reverse().map(customer => (
            <Card key={customer.id} className="!p-4 flex items-center justify-between border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                  {customer.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{customer.name}</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{customer.phone}</div>
                </div>
              </div>
            </Card>
          ))}
          {customers.length === 0 && (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">لا يوجد عملاء حتى الآن</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ButtonWithIcon({ icon, text, primary = false }: { icon: React.ReactNode, text: string, primary?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
      primary 
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' 
        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
    }`}>
      {icon}
      {text}
    </div>
  )
}

