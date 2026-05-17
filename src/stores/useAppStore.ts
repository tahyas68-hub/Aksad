import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { Product, Customer, Contract, Installment, PaymentReceipt, AppNotification } from '../types';

interface AppState {
  products: Product[];
  customers: Customer[];
  contracts: Contract[];
  payments: PaymentReceipt[];
  notifications: AppNotification[];

  // Inventory Actions
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (products: Omit<Product, 'id' | 'status'>[]) => void;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  importCustomers: (customers: Omit<Customer, 'id' | 'createdAt'>[]) => void;

  // Contract Actions
  createContract: (contractData: Omit<Contract, 'id' | 'status' | 'installments' | 'remainingAmount' | 'createdAt'>) => void;
  updateInstallmentPayment: (contractId: string, installmentId: string, amount: number) => void;
  archiveContract: (contractId: string) => void;
  deleteContract: (id: string) => void;

  // Notification Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'date'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Settings Action
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  resetDatabase: () => void;
}

const generateInstallments = (
  contractId: string,
  amountPerInstallment: number,
  count: number,
  type: 'daily' | 'weekly' | 'monthly',
  startDate: string
): Installment[] => {
  const installments: Installment[] = [];
  let currentDate = new Date(startDate);

  for (let i = 1; i <= count; i++) {
    if (type === 'daily') currentDate = addDays(currentDate, 1);
    else if (type === 'weekly') currentDate = addWeeks(currentDate, 1);
    else if (type === 'monthly') currentDate = addMonths(currentDate, 1);

    installments.push({
      id: uuidv4(),
      contractId,
      number: i,
      type,
      dueDate: currentDate.toISOString(),
      amount: amountPerInstallment,
      paidAmount: 0,
      status: 'pending',
    });
  }

  return installments;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [],
      customers: [],
      contracts: [],
      payments: [],
      notifications: [],
      theme: 'light',

      setTheme: (theme) => set({ theme }),

      addProduct: (product) => set((state) => ({
        products: [...state.products, {
          ...product,
          id: uuidv4(),
          status: (product.stock > 0 ? 'available' : 'out_of_stock') as 'available' | 'out_of_stock'
        }]
      })),

      updateProduct: (id, data) => set((state) => ({
        products: state.products.map(p => {
          if (p.id === id) {
            const updated = { ...p, ...data };
            updated.status = (updated.stock > 0 ? 'available' : 'out_of_stock') as 'available' | 'out_of_stock';
            return updated;
          }
          return p;
        })
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      importProducts: (newProducts) => set((state) => {
        const mapped = newProducts.map(p => ({
          ...p,
          id: uuidv4(),
          status: (p.stock > 0 ? 'available' : 'out_of_stock') as 'available' | 'out_of_stock'
        }));
        return { products: [...state.products, ...mapped] };
      }),

      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, {
          ...customer,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        }]
      })),

      updateCustomer: (id, data) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c)
      })),

      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),

      importCustomers: (newCustomers) => set((state) => {
        const mapped = newCustomers.map(c => ({
          ...c,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        }));
        return { customers: [...state.customers, ...mapped] };
      }),

      createContract: (data) => set((state) => {
        const contractId = uuidv4();
        const principal = data.totalAmount - data.downPayment;
        const amountPerInstallment = parseFloat((principal / data.installmentsCount).toFixed(2));
        
        const installments = generateInstallments(
          contractId,
          amountPerInstallment,
          data.installmentsCount,
          data.installmentType,
          data.startDate
        );

        // Adjust last installment for rounding issues
        const totalInstallmentsAmount = amountPerInstallment * data.installmentsCount;
        if (totalInstallmentsAmount !== principal) {
            const diff = principal - totalInstallmentsAmount;
            installments[installments.length - 1].amount += diff;
        }

        const newContract: Contract = {
          ...data,
          id: contractId,
          status: 'active',
          remainingAmount: principal,
          installments,
          createdAt: new Date().toISOString()
        };

        // Deduct stock
        const updatedProducts = state.products.map(p => 
          p.id === data.productId ? { ...p, stock: p.stock - 1, status: (p.stock - 1) > 0 ? 'available' as const : 'out_of_stock' as const } : p
        );

        return { 
          contracts: [...state.contracts, newContract],
          products: updatedProducts
        };
      }),

      updateInstallmentPayment: (contractId, installmentId, amount) => set((state) => {
        let paymentMade = false;
        
        const newContracts = state.contracts.map(contract => {
          if (contract.id !== contractId) return contract;

          let paymentAmountRemaining = amount;
          const updatedInstallments = contract.installments.map(inst => {
            if (inst.id === installmentId) {
              const toPay = Math.min(inst.amount - inst.paidAmount, paymentAmountRemaining);
              const newPaid = inst.paidAmount + toPay;
              paymentAmountRemaining -= toPay;
              paymentMade = true;

              return {
                ...inst,
                paidAmount: newPaid,
                status: (newPaid >= inst.amount ? 'paid' : 'pending') as 'paid' | 'pending' | 'late'
              };
            }
            return inst;
          });

          const totalPaid = updatedInstallments.reduce((sum, inst) => sum + inst.paidAmount, 0) + contract.downPayment;
          const remainingAmount = Math.max(0, contract.totalAmount - totalPaid);
          const status = remainingAmount <= 0 ? 'completed' : contract.status;

          if (status === 'completed' && contract.status !== 'completed') {
             // Side effect handled later
          }

          return {
            ...contract,
            installments: updatedInstallments,
            remainingAmount,
            status
          };
        });

        if (paymentMade) {
          const receipt: PaymentReceipt = {
            id: uuidv4(),
            contractId,
            installmentId,
            customerId: state.contracts.find(c => c.id === contractId)?.customerId || '',
            amount,
            date: new Date().toISOString()
          };
          return {
            contracts: newContracts,
            payments: [...state.payments, receipt]
          };
        }

        return { contracts: newContracts };
      }),

      archiveContract: (id) => set((state) => ({
        contracts: state.contracts.map(c => c.id === id ? { ...c, status: 'archived' } : c)
      })),

      deleteContract: (id) => set((state) => ({
        contracts: state.contracts.filter(c => c.id !== id),
        payments: state.payments.filter(p => p.contractId !== id)
      })),

      addNotification: (data) => set((state) => ({
        notifications: [{
          ...data,
          id: uuidv4(),
          read: false,
          date: new Date().toISOString()
        }, ...state.notifications]
      })),

      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      clearNotifications: () => set({ notifications: [] }),

      resetDatabase: () => set({
        products: [],
        customers: [],
        contracts: [],
        payments: [],
        notifications: []
      })
    }),
    {
      name: 'installment-store',
    }
  )
);
