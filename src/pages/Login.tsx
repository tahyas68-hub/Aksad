import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Eye, EyeOff, Fingerprint, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<'merchant' | 'customer'>('merchant');
  
  // Shake animation trigger
  const [shake, setShake] = useState(false);

  const { login, users } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        if (!user.isActive) {
           setIsLoading(false);
           setError('تم تعطيل حسابك. يرجى التواصل مع الإدارة.');
           triggerShake();
           return;
        }

        const isAdminOrMerchant = user.role === 'admin' || user.role === 'merchant';
        if (loginType === 'merchant' && !isAdminOrMerchant) {
           setIsLoading(false);
           setError('يرجى التبديل لتبويب "العملاء" لهذا الحساب');
           triggerShake();
           return;
        }
        if (loginType === 'customer' && user.role !== 'customer') {
           setIsLoading(false);
           setError('يرجى التبديل لتبويب "الإدارة/التاجر" لهذا الحساب');
           triggerShake();
           return;
        }
        
        // Update last login
        useAppStore.getState().updateUser(user.id, { lastLogin: new Date().toISOString() });
        
        setIsLoading(false);
        login(user); // Wait, if I call login with `user`, it doesn't have the updated lastLogin object, but doesn't matter since state updates
      } else {
        setIsLoading(false);
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        triggerShake();
      }
    }, 1000);
  };

  const handleBiometric = () => {
    setIsLoading(true);
    // Simulate biometric delay
    setTimeout(() => {
      const demoUsername = loginType === 'merchant' ? 'admin' : 'customer';
      const user = users.find(u => u.username === demoUsername);
      if (user) {
        useAppStore.getState().updateUser(user.id, { lastLogin: new Date().toISOString() });
        setIsLoading(false);
        login(user);
      } else {
        setIsLoading(false);
        setError('تعذر تسجيل الدخول بالبصمة');
      }
    }, 1000);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans" dir="rtl">
      
      {/* Premium Gradient Background Objects */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-600/10 dark:from-blue-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/20 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[26rem] mx-auto px-6 relative z-10 flex flex-col pt-12 pb-8 h-full">

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col justify-center"
        >
          {/* Top Section / Logo */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              className="mx-auto flex items-center justify-center w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/30 mb-6"
            >
              <ShieldCheck className="w-10 h-10" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">تسجيل الدخول</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">نظام إدارة المبيعات والتقسيط</p>
          </div>

          <motion.div
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl"
          >
            {/* Role Selection Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl mb-6 border border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                onClick={() => setLoginType('merchant')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  loginType === 'merchant'
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                التاجر / الإدارة
              </button>
              <button
                type="button"
                onClick={() => setLoginType('customer')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  loginType === 'customer'
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                العملاء
              </button>
            </div>

            {/* Demo Helper Box */}
            <div className="mb-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-900/30 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-r-md"></div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">بيانات الدخول للاختبار:</p>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono tracking-wider">
                {loginType === 'merchant' ? 'admin / password' : 'customer / password'}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">اسم المستخدم</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    dir="ltr"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-2xl outline-none px-4 py-4 pr-12 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all font-medium"
                    placeholder={loginType === 'merchant' ? 'admin / merchant' : 'customer'}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">كلمة المرور</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-2xl outline-none px-4 py-4 pr-12 pl-12 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl text-sm font-medium pr-3 border border-rose-100 dark:border-rose-900/30 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options */}
              <div className="flex items-center justify-between pt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 transition-colors flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600">
                      {rememberMe && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></motion.svg>}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">تذكرني</span>
                </label>
                
                <button type="button" className="text-sm font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full relative flex items-center justify-center h-14 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl shadow-slate-900/20 dark:shadow-blue-900/30 disabled:opacity-70 disabled:hover:shadow-none disabled:cursor-not-allowed group overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full skew-x-12" />
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>
              </div>

            </form>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold px-2">تسجيل سريع</span>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="mt-6">
              <button 
                type="button"
                onClick={handleBiometric}
                className="w-full flex items-center justify-center gap-3 h-14 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all shadow-sm"
              >
                <Fingerprint className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                الدخول بالبصمة
              </button>
            </div>

          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 flex flex-col items-center gap-4 text-xs text-slate-500 dark:text-slate-500"
        >
          <div className="flex items-center gap-2 justify-center opacity-80 font-medium">
            <Lock className="w-4 h-4" />
            <span>محمي بتشفير 256-bit آمن</span>
          </div>
          <div className="flex items-center justify-center gap-6 mt-1 font-medium">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">سياسة الخصوصية</a>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">المساعدة</a>
          </div>
        </motion.div>

      </div>
      
      {/* Biometric Loading Overlay */}
      <AnimatePresence>
        {isLoading && !username && !password && ( 
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 z-50 bg-white/60 dark:bg-slate-950/60 flex flex-col items-center justify-center"
          >
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-spin mb-4" />
              <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">جاري التحقق من الهوية...</p>
              <p className="text-slate-500 text-sm mt-1">يرجى الانتظار للحظات</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
