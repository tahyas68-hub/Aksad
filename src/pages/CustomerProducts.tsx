import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Package } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Navigate } from 'react-router-dom';

export default function CustomerProductsPage() {
  const { products, currentUser } = useAppStore();

  if (currentUser?.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  const availableProducts = products.filter(p => p.status === 'available');

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">المنتجات المتاحة للتقسيط</h2>
        <p className="text-sm text-slate-500">تصفح أحدث المنتجات المتوفرة</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {availableProducts.map(product => (
          <Card key={product.id} className="overflow-hidden border-slate-100 dark:border-slate-800">
            <div className="p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Package className="w-8 h-8 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2">{product.name}</h3>
                  <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {product.category}
                  </span>
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(product.price)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  متوفر {product.stock} وحدة
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
