import React, { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, clearNotifications } = useAppStore();

  useEffect(() => {
    // Automatically mark all as read when opening page
    notifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  }, [notifications, markNotificationAsRead]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'payment': return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'late': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <h2 className="font-bold text-gray-900 dark:text-gray-100">الإشعارات</h2>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearNotifications}>
            مسح الكل
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد إشعارات</div>
        ) : (
          notifications.map(notification => (
            <Card key={notification.id} className="!p-4 flex gap-4 items-start relative opacity-90 hover:opacity-100 transition-opacity border-gray-100 dark:border-gray-800">
              <div className="mt-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{notification.title}</h4>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                    {formatDistanceToNow(new Date(notification.date), { addSuffix: true, locale: ar })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
