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

    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Find all pending installments that are due in exactly 3 days
    contracts.forEach(contract => {
      if (contract.status !== 'active') return;

      contract.installments.forEach(installment => {
        if (installment.status !== 'pending') return;

        const dueDate = new Date(installment.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Calculate diff in days
        const diffTime = Math.abs(dueDate.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 3) {
          // It's exactly 3 days away. Check if we already have a notification for this.
          const notificationId = `whatsapp-due-${installment.id}`;
          
          const alreadyNotified = notifications.some(n => n.relatedId === notificationId);
          if (!alreadyNotified) {
            // Find the customer
            const customer = useAppStore.getState().customers.find(c => c.id === contract.customerId);
            
            if (customer) {
              // Add system notification for admin
              addNotification({
                title: 'تذكير واتساب تلقائي',
                message: `تم إرسال تذكير تلقائي للعميل ${customer.name} بشأن قسط قادم بعد 3 أيام بقيمة ${installment.amount.toLocaleString()} د.ع`,
                type: 'whatsapp',
                relatedId: notificationId, // Use relatedId to prevent duplicates
                customerId: customer.id
              });

              // Add a separate notification for the customer specifically! Wait, the same notification can be visible to both Admin and Customer because we changed `myNotifications` filter in NotificationsPage.

              // Simulate sending actual WhatsApp message
              // Example: a WhatsApp message link
              const text = `أهلاً ${customer.name}، نود تذكيرك بقسط قادم بقيمة ${installment.amount.toLocaleString()} د.ع بعد 3 أيام. يرجى الاستعداد للسداد.`;
              const encodedText = encodeURIComponent(text);
              const phone = customer.phone.replace(/\D/g, ''); // Try to sanitize phone number
              console.log(`[Auto WhatsApp] For ${customer.name}: https://wa.me/${phone}?text=${encodedText}`);
            }
          }
        }
      });
    });

    sessionStorage.setItem('auto_notifications_checked', 'true');
  }, [contracts, notifications, addNotification, currentUser]);
}
