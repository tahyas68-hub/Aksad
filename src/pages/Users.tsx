import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Search, Plus, Edit2, Trash2, Shield, User as UserIcon, Lock, Power, Key } from 'lucide-react';
import { User, UserRole } from '../types';
import { format } from 'date-fns';

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'merchant' as UserRole,
    isActive: true,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchTerm) || user.username.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      updateUser(editingUserId, payload);
    } else {
      if (!formData.password) {
        alert('كلمة المرور مطلوبة للمستخدم الجديد');
        return;
      }
      addUser(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', password: '', role: 'merchant', isActive: true });
    setEditingUserId(null);
  };

  const openEdit = (user: User) => {
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setEditingUserId(user.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('تحذير: هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
      deleteUser(id);
    }
  };

  const toggleStatus = (user: User) => {
    const statusText = user.isActive ? 'تعطيل' : 'تفعيل';
    if (confirm(`هل أنت متأكد من ${statusText} حساب ${user.name}؟`)) {
      updateUser(user.id, { isActive: !user.isActive });
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <Lock className="w-16 h-16 text-rose-500/50 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">منطقة محظورة</h2>
        <p className="text-slate-500 dark:text-slate-400">عذراً، غير مصرح لك بالوصول لإدارة المستخدمين. هذه الصفحة مخصصة لمدير النظام فقط.</p>
      </div>
    );
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'مدير نطام';
      case 'merchant': return 'تاجر';
      case 'customer': return 'عميل';
    }
  };

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">إدارة المستخدمين</h2>
        <p className="text-sm text-slate-500">إضافة وتعديل صلاحيات الدخول للنظام</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input 
            type="text" 
            placeholder="البحث بالاسم أو رقم الهاتف..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 h-12 rounded-2xl bg-white dark:bg-slate-900"
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
            className="h-12 rounded-2xl w-32 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <option value="all">الكل</option>
            <option value="admin">إدارة</option>
            <option value="merchant">تجار</option>
            <option value="customer">عملاء</option>
          </Select>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center h-12 w-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <Card key={user.id} className={`p-5 flex flex-col gap-4 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all hover:shadow-md ${!user.isActive ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${
                  user.role === 'admin' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 
                  user.role === 'merchant' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                }`}>
                  {user.role === 'admin' ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`font-bold ${user.isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 line-through'}`}>{user.name}</h3>
                  <div className="text-xs text-slate-500 font-medium mt-0.5" dir="ltr">@{user.username}</div>
                </div>
              </div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                {user.isActive ? 'نشط' : 'معطل'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
               <div>
                  <div className="text-slate-500 text-xs mb-1">الصلاحية</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{getRoleName(user.role)}</div>
               </div>
               <div>
                  <div className="text-slate-500 text-xs mb-1">آخر ظهور</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300" dir="ltr">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'yyyy/MM/dd HH:mm') : 'لم يسجل الدخول'}
                  </div>
               </div>
            </div>
            
            {user.id !== currentUser.id && (
              <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button title="إيقاف/تفعيل الحساب" onClick={() => toggleStatus(user)} className={`flex-1 flex items-center justify-center p-2.5 rounded-xl font-medium text-xs transition-colors ${user.isActive ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'}`}>
                  <Power className="w-4 h-4 ml-1.5" />
                  {user.isActive ? 'إيقاف' : 'تفعيل'}
                </button>
                <button title="تعديل الحساب" onClick={() => openEdit(user)} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl font-medium text-xs transition-colors">
                  <Edit2 className="w-4 h-4 ml-1" />
                  تعديل
                </button>
                <button title="حذف" onClick={() => handleDelete(user.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors shrink-0">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {user.id === currentUser.id && (
              <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold p-2.5 rounded-xl text-center">
                  هذا حسابك الحالي
                </div>
              </div>
            )}
          </Card>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            لا توجد استعراضات تطابق بحثك.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 space-y-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingUserId ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">يرجى تعبئة الحقول أدناه لحفظ الحساب.</p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">الاسم الكامل</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">اسم المستخدم / رقم الهاتف</label>
                <Input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} dir="ltr" className="h-12 rounded-xl text-left" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  كلمة المرور
                  {editingUserId && <span className="text-xs text-slate-400 font-normal mr-2">(اتركه فارغاً للاحتفاظ بالحالية)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <Input type="password" required={!editingUserId} placeholder={editingUserId ? "••••••••" : "أدخل كلمة مرور قوية"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} dir="ltr" className="h-12 rounded-xl pr-10 text-left" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">صلاحية الحساب</label>
                <Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="h-12 rounded-xl">
                  <option value="admin">مدير نظام (صلاحيات كاملة)</option>
                  <option value="merchant">تاجر (إدارة مبيعات)</option>
                  <option value="customer">عميل (عرض فقط)</option>
                </Select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="peer sr-only" />
                    {formData.isActive && <Shield className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">تفعيل حساب المستخدم</span>
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl py-3 font-semibold transition-colors">
                  إلغاء
                </button>
                <button type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold shadow-sm shadow-indigo-600/20 transition-colors">
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
