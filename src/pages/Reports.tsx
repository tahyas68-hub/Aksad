import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, TrendingUp, TrendingDown, PieChart as PieChartIcon, Calendar as CalendarIcon, Filter, DollarSign, Share2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { downloadExcel } from '../lib/excel';
import { Navigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, subMonths, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export default function ReportsPage() {
  const { contracts, payments, customers, products, expenses, currentUser } = useAppStore();
  const [dateFilter, setDateFilter] = useState('month');

  if (currentUser?.role === 'customer') {
    return <Navigate to="/" replace />;
  }

  // Generate trend data based on filter
  const today = new Date();
  let startDate = new Date();
  
  if (dateFilter === 'week') startDate = subDays(today, 7);
  else if (dateFilter === 'month') startDate = subMonths(today, 1);
  else if (dateFilter === 'two_months') startDate = subMonths(today, 2);
  else if (dateFilter === 'all') startDate = new Date(2000, 0, 1);

  // Filters setup
  const filteredContracts = contracts.filter(c => isAfter(new Date(c.createdAt), startOfDay(startDate)));
  const filteredPayments = payments.filter(p => isAfter(new Date(p.date), startOfDay(startDate)));
  const filteredExpenses = expenses.filter(e => isAfter(new Date(e.date), startOfDay(startDate)));

  const totalSales = filteredContracts.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalCollected = filteredContracts.reduce((sum, c) => sum + c.downPayment, 0) + filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  let totalPurchaseCost = 0;
  filteredContracts.forEach(contract => {
    const product = products.find(p => p.id === contract.productId);
    if (product?.purchasePrice) totalPurchaseCost += product.purchasePrice;
  });

  const netProfit = totalSales - totalPurchaseCost - totalExpenses;
  const remainingBalances = totalSales - totalCollected;

  // Chart Data preparation
  const chartData = [];
  const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : dateFilter === 'two_months' ? 60 : 30; // approx
  
  for (let i = days - 1; i >= 0; i -= Math.max(1, Math.floor(days/7))) {
    const d = subDays(today, i);
    const dayStart = startOfDay(d);
    const dayEnd = endOfDay(d);
    
    const daySales = contracts.filter(c => isAfter(new Date(c.createdAt), dayStart) && isBefore(new Date(c.createdAt), dayEnd)).reduce((sum, c) => sum + c.totalAmount, 0);
    const dayCollections = payments.filter(p => isAfter(new Date(p.date), dayStart) && isBefore(new Date(p.date), dayEnd)).reduce((sum, p) => sum + p.amount, 0);
    const dayExpenses = expenses.filter(e => isAfter(new Date(e.date), dayStart) && isBefore(new Date(e.date), dayEnd)).reduce((sum, e) => sum + e.amount, 0);

    chartData.push({
      name: format(d, 'MMM dd'),
      Sales: daySales,
      Collections: dayCollections,
      Expenses: dayExpenses,
      Profit: daySales - dayExpenses
    });
  }

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];
  const pieData = [
    { name: 'المتحصلات', value: totalCollected },
    { name: 'بواقي لم تحصل', value: remainingBalances },
  ];

  const handleExport = () => {
    const reportData = [
      { Metric: 'Total Sales Revenue', Value: totalSales },
      { Metric: 'Total Collections', Value: totalCollected },
      { Metric: 'Outstanding Balances', Value: remainingBalances },
      { Metric: 'Total Expenses', Value: totalExpenses },
      { Metric: 'Estimated Net Profit', Value: netProfit },
    ];
    downloadExcel(reportData, `Financial_Report_${dateFilter}`);
  };

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">تقارير وتحليلات</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">تحليل الأداء المالي والمبيعات</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <select
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="week">آخر 7 أيام</option>
          <option value="month">هذا الشهر</option>
          <option value="two_months">آخر شهرين</option>
          <option value="all">كل الوقت</option>
        </select>
        
        <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm pr-3 pl-4 flex gap-2 w-max">
          <Download className="w-4 h-4" />
          تصدير Excel
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 border-none shadow-lg shadow-indigo-500/20 text-white">
          <p className="text-white/80 text-sm mb-1">صافي الأرباح</p>
          <h3 className="text-2xl font-bold">{formatCurrency(netProfit)}</h3>
          <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded-md">مقدرة</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 border-none shadow-lg shadow-emerald-500/20 text-white">
          <p className="text-white/80 text-sm mb-1">إجمالي المبيعات</p>
          <h3 className="text-2xl font-bold">{formatCurrency(totalSales)}</h3>
          <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded-md">{filteredContracts.length} عقد</div>
        </Card>
      </div>

      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          مؤشر المبيعات المتجه
        </h3>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-indigo-500" />
          توزيع الإيرادات والأرصدة
        </h3>
        <div className="h-48 w-full flex items-center justify-center" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              {entry.name}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
