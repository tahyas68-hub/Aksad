import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';

export function useAutoNotifications() {
  const { contracts, addNotification, currentUser, notifications } = useAppStore();

  useEffect(() => {
    // Only run if user is logged in
    if (!currentUser) return;

    if (sessionStorage.getItem('auto_notifications_checked')) return;
    
    // We need to wait for store hydration, so we can set a small timeout or check if state is fully loaded
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Find all pending installments
    contracts.forEach(contract => {
      if (contract.status !== 'active') return;

      contract.installments.forEach(installment => {
        if (installment.status !== 'pending') return;

        const dueDate = new Date(installment.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Calculate diff in days
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const customer = useAppStore.getState().customers.find(c => c.id === contract.customerId);
        if (!customer) return;

        // 3 Days before notification
        if (diffDays === 3) {
          const notificationId = `reminder-3days-${installment.id}`;
          const alreadyNotified = notifications.some(n => n.relatedId === notificationId);
          
          if (!alreadyNotified) {
            addNotification({
              title: 'موعد القسط قد اقترب',
              message: `عزيزي العميل، موعد سداد القسط القادم بقيمة ${installment.amount.toLocaleString()} د.ع هو بعد 3 أيام. يرجى الاستعداد للسداد.`,
              type: 'due',
              relatedId: notificationId,
              customerId: customer.id
            });
            
            // Also notify admin
            addNotification({
              title: 'تذكير تلقائي',
              message: `تم إرسال تذكير للعميل ${customer.name} بشأن قسط يستحق بعد 3 أيام.`,
              type: 'due',
              relatedId: `admin-${notificationId}`,
              customerId: customer.id
            });
          }
        }

        // Overdue notification (passed due date)
        if (diffDays < 0) {
          const notificationId = `overdue-${installment.id}`;
          const alreadyNotified = notifications.some(n => n.relatedId === notificationId);
          
          if (!alreadyNotified) {
            addNotification({
              title: 'موعد القسط قد فات',
              message: `عزيزي العميل، لقد فات موعد سداد القسط المستحق بتاريخ ${dueDate.toLocaleDateString('ar-IQ')} بقيمة ${installment.amount.toLocaleString()} د.ع. يرجى المبادرة بالسداد.`,
              type: 'late',
              relatedId: notificationId,
              customerId: customer.id
            });

            // Also notify admin
            addNotification({
              title: 'تنبيه دفع متأخر',
              message: `تأخر العميل ${customer.name} عن سداد قسط مستحق بتاريخ ${dueDate.toLocaleDateString('ar-IQ')}.`,
              type: 'late',
              relatedId: `admin-${notificationId}`,
              customerId: customer.id
            });
          }
        }
      });
    });

    sessionStorage.setItem('auto_notifications_checked', 'true');
  }, [contracts, notifications, addNotification, currentUser]);
}
