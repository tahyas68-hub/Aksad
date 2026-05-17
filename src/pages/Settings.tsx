import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Moon, Sun, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, resetDatabase } = useAppStore();

  const handleReset = () => {
    if (confirm('تحذير: سيتم حذف جميع بيانات التطبيق نهائياً. هل أنت متأكد؟')) {
      resetDatabase();
      alert('تم إعادة ضبط قاعدة البيانات بنجاح.');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <Card className="flex items-center justify-between !p-4 dark:bg-gray-900 border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div className="font-medium">الوضع الليلي</div>
        </div>
        
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <div 
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${theme === 'dark' ? '-translate-x-7' : '-translate-x-1'}`}
          />
        </button>
      </Card>

      <Card className="flex flex-col gap-3 !p-4 dark:bg-gray-900 border-rose-100 dark:border-rose-900/50">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-900/30">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="font-medium">إعادة ضبط قاعدة البيانات</div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">سيتم مسح كافة البيانات بشكل نهائي.</p>
        <button 
          onClick={handleReset}
          className="mt-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl px-4 py-2 text-center transition-colors"
        >
          تصفير قاعدة البيانات
        </button>
      </Card>

      <Card className="!p-4 dark:bg-gray-900 border-gray-100 dark:border-gray-800 space-y-4 text-gray-900 dark:text-gray-100">
         <h3 className="font-bold">حول</h3>
         <p className="text-sm text-gray-500 dark:text-gray-400">
           نظام إدارة المبيعات بالتقسيط<br />
           الإصدار 1.0.0
         </p>
      </Card>
    </div>
  );
}
