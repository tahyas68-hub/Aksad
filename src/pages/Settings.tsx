import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Moon, Sun, Trash2, LogOut, AlertOctagon, CheckSquare, Square, Package, Wallet, FileText, Bell, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { theme, setTheme, resetDatabase, resetPartially, logout, currentUser } = useAppStore();
  const navigate = useNavigate();
  const [resetStep, setResetStep] = useState(0); // 0: hidden, 1: confirm full, 2: password
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // Granular Options
  const [resetOptions, setResetOptions] = useState({
    contracts: true,
    payments: true,
    notifications: true,
    inventory: false,
    fullDb: false, // if true, ignores others and acts like full reset
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const executeReset = () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    // Simplistic auth check for simulation
    if (resetPassword === currentUser.password || currentUser.password === 'password') { // fallback if unset
       if (resetOptions.fullDb) {
         resetDatabase();
       } else {
         resetPartially({
           contracts: resetOptions.contracts,
           payments: resetOptions.payments,
           notifications: resetOptions.notifications,
           inventory: resetOptions.inventory
         });
         
         // Add audit log notification if it's not a full DB reset (since full db reset deletes users/notifications)
         if (!resetOptions.notifications && !resetOptions.fullDb) {
           useAppStore.getState().addNotification({
             title: 'عملية ضبط نظام',
             message: `قام ${currentUser.name} بإجراء مسح جزئي للبيانات`,
             type: 'warning'
           });
         }
       }
       setResetStep(0);
       setResetPassword('');
       alert('تم مسح البيانات المحددة بنجاح!');
       if (resetOptions.fullDb) {
         logout();
       }
    } else {
       setResetError('كلمة المرور غير صحيحة');
    }
  };

  const OptionCheckbox = ({ label, icon, checked, onChange, disabled = false }: any) => (
    <label className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
      checked ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <div className={`text-${checked ? 'rose' : 'slate'}-500`}>
        {checked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
      </div>
      <div className={`p-1.5 rounded-lg ${checked ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
        {icon}
      </div>
      <span className={`font-semibold text-sm ${checked ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
    </label>
  );

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">الإعدادات</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">إدارة تفضيلات وخيارات النظام</p>
      </div>

      <Card className="flex items-center justify-between !p-5 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div className="font-bold">الوضع الليلي</div>
        </div>
        
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`w-14 h-7 rounded-full py-1 px-1 transition-colors relative shadow-inner ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}
        >
          <div 
            className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${theme === 'dark' ? '-translate-x-8' : '-translate-x-0'}`}
          />
        </button>
      </Card>

      {currentUser?.role === 'admin' && (
        <Card className="flex flex-col gap-4 !p-5 dark:bg-slate-950 border-indigo-200/60 dark:border-indigo-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 relative z-10">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">إدارة المستخدمين والصلاحيات</div>
              <p className="text-xs text-slate-500 mt-0.5">إضافة، تعديل وحذف حسابات الدخول وتعيين الصلاحيات الخاصة بهم.</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => navigate('/users')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 py-3 font-bold transition-all shadow-sm shadow-indigo-500/20 w-full sm:w-auto"
            >
              مدير المستخدمين
            </button>
          </div>
        </Card>
      )}

      {currentUser?.role === 'admin' && (
        <Card className="flex flex-col gap-4 !p-5 dark:bg-slate-950 border-rose-200/60 dark:border-rose-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 relative z-10">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/30">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">منطقة الخطر (إعادة ضبط النظام)</div>
              <p className="text-xs text-rose-500/80 mt-0.5">تحذير: مسح البيانات لا يمكن التراجع عنه.</p>
            </div>
          </div>
          
          {resetStep === 0 && (
            <div className="relative z-10 pt-2 space-y-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">حدد البيانات المراد تصفيرها:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div onClick={() => !resetOptions.fullDb && setResetOptions({...resetOptions, contracts: !resetOptions.contracts})}>
                  <OptionCheckbox label="عقود البيع" icon={<FileText className="w-4 h-4"/>} checked={resetOptions.contracts || resetOptions.fullDb} disabled={resetOptions.fullDb} />
                </div>
                <div onClick={() => !resetOptions.fullDb && setResetOptions({...resetOptions, payments: !resetOptions.payments})}>
                  <OptionCheckbox label="سجلات الدفع" icon={<Wallet className="w-4 h-4"/>} checked={resetOptions.payments || resetOptions.fullDb} disabled={resetOptions.fullDb} />
                </div>
                <div onClick={() => !resetOptions.fullDb && setResetOptions({...resetOptions, notifications: !resetOptions.notifications})}>
                  <OptionCheckbox label="الإشعارات" icon={<Bell className="w-4 h-4"/>} checked={resetOptions.notifications || resetOptions.fullDb} disabled={resetOptions.fullDb} />
                </div>
                <div onClick={() => !resetOptions.fullDb && setResetOptions({...resetOptions, inventory: !resetOptions.inventory})}>
                  <OptionCheckbox label="المخزون والمنتجات" icon={<Package className="w-4 h-4"/>} checked={resetOptions.inventory || resetOptions.fullDb} disabled={resetOptions.fullDb} />
                </div>
              </div>

              <div className="pt-2">
                <div onClick={() => setResetOptions({...resetOptions, fullDb: !resetOptions.fullDb})}>
                  <OptionCheckbox label="تصفير النظام بالكامل (العملاء، المستخدمين، وكل ما سبق)" icon={<Trash2 className="w-4 h-4"/>} checked={resetOptions.fullDb} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setResetStep(1)}
                  disabled={!resetOptions.fullDb && !resetOptions.contracts && !resetOptions.payments && !resetOptions.notifications && !resetOptions.inventory}
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-6 py-3 font-bold transition-all shadow-sm shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  الاستمرار للحذف
                </button>
              </div>
            </div>
          )}

          {resetStep === 1 && (
            <div className="mt-2 p-5 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-4 animate-in fade-in zoom-in-95 relative z-10">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 text-lg">تأكيد نهائي</h4>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-500 mt-1">هل أنت متأكد تماماً؟ نوصي بشدة بأخذ نسخة احتياطية للبيانات قبل إكمال هذه الخطوة حيث لا يمكن استرجاعها مطلقاً.</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setResetStep(2)} className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-sm">نعم، أدرك الخطر وموافق</button>
                <button onClick={() => setResetStep(0)} className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700">تراجع</button>
              </div>
            </div>
          )}

          {resetStep === 2 && (
            <div className="mt-2 p-5 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-4 animate-in fade-in zoom-in-95 relative z-10">
              <p className="text-sm text-rose-700 dark:text-rose-400 font-bold">يرجى إدخال كلمة المرور الخاصة بحسابك كمدير للتنفيذ:</p>
              <div>
                <Input 
                  type="password"
                  placeholder="••••••••"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  dir="ltr"
                  className="h-12 rounded-xl border-rose-200 focus:border-rose-500 focus:ring-rose-500/20"
                />
                {resetError && <p className="text-xs text-rose-600 font-bold mt-2">{resetError}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={executeReset} className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-sm shadow-rose-600/20">تأكيد ومسح البيانات بصورة دائمة</button>
                <button onClick={() => { setResetStep(0); setResetPassword(''); setResetError(''); }} className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700">إلغاء</button>
              </div>
            </div>
          )}
        </Card>
      )}

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-4 mt-6 text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-white dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 transition-all font-bold shadow-sm"
      >
        <LogOut className="w-5 h-5" />
        تسجيل الخروج
      </button>

      <Card className="!p-6 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
         <div className="flex items-center gap-3">
           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
             <AlertOctagon className="w-6 h-6" />
           </div>
           <div>
             <h3 className="font-bold text-lg">عن النظام</h3>
             <p className="text-sm font-medium text-slate-500 mt-0.5">منصة إدارة البيع بالتقسيط والمحصلات</p>
           </div>
         </div>
         <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-2 mt-4 text-sm font-medium">
           <div className="flex justify-between">
             <span className="text-slate-500">الإصدار</span>
             <span className="text-slate-700 dark:text-slate-300">1.5.0 Production</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500">حسابك الحالي</span>
             <span className="text-slate-700 dark:text-slate-300 font-bold">{currentUser?.name}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500">الصلاحية</span>
             <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{currentUser?.role}</span>
           </div>
         </div>
      </Card>
    </div>
  );
}
