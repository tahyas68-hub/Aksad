import React from "react";
import { useAppStore } from "../stores/useAppStore";
import { Card } from "../components/ui/Card";
import {
  Bell,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arMA as ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    clearNotifications,
    currentUser,
  } = useAppStore();
  const navigate = useNavigate();

  // For this demo, let's treat all notifications as relevant. In real app we would filter by userId.
  const myNotifications = [...notifications].reverse();

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case "late":
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-indigo-500" />;
      case "due":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleAction = (notificationId: string, relatedId?: string) => {
    markNotificationAsRead(notificationId);
    if (relatedId) {
      if (currentUser?.role === "customer") {
        navigate(`/my-contracts`); // Simpler for customer
      } else {
        navigate(`/contracts/${relatedId}`);
      }
    }
  };

  return (
    <div className="space-y-6 pb-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            الإشعارات
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            تنبيهات المدفوعات والعقود
          </p>
        </div>
        {myNotifications.length > 0 && (
          <button
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            onClick={clearNotifications}
          >
            مسح الكل
          </button>
        )}
      </div>

      <div className="space-y-3">
        {myNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            لا توجد إشعارات
          </div>
        ) : (
          myNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`!p-4 flex gap-4 items-start relative transition-all border-gray-100 dark:border-gray-800 ${!notification.read ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30" : ""}`}
            >
              {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500" />
              )}
              <div className="mt-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 pr-2">
                <div className="flex justify-between items-start mb-1">
                  <h4
                    className={`font-semibold ${!notification.read ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.date), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  {notification.message}
                </p>

                <div className="flex gap-2">
                  {notification.relatedId && (
                    <button
                      onClick={() =>
                        handleAction(notification.id, notification.relatedId)
                      }
                      className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      عرض التفاصيل
                    </button>
                  )}
                  {!notification.read && (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="text-xs font-medium text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
