import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { Product, ProductCategory, Customer, Contract, Installment, PaymentReceipt, AppNotification, User, UserRole } from '../types';

import { Expense } from '../types';

interface AppState {
  users: User[];
  currentUser: User | null;

  // User Actions
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  productCategories: ProductCategory[];
  products: Product[];
  customers: Customer[];
  contracts: Contract[];
  payments: PaymentReceipt[];
  notifications: AppNotification[];
  expenses: Expense[];

  // Inventory Actions
  addProductCategory: (category: Omit<ProductCategory, 'id'>) => void;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => void;
  deleteProductCategory: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'status'> & { purchasePrice?: number }) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (products: (Omit<Product, 'id' | 'status'> & { purchasePrice?: number })[]) => void;

  // Expenses Actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

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
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  resetDatabase: () => void;
  resetPartially: (flags: { contracts?: boolean, payments?: boolean, notifications?: boolean, inventory?: boolean }) => void;
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
      users: [
        {
          id: '1',
          name: 'مدير النظام',
          username: 'admin',
          password: 'password',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'أحمد التاجر',
          username: 'merchant',
          password: 'password',
          role: 'merchant',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'سالم العميل',
          username: 'customer',
          password: 'password',
          role: 'customer',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      currentUser: null,
      productCategories: [
        { id: uuidv4(), name: 'بطاريات' },
        { id: uuidv4(), name: 'إطارات' },
        { id: uuidv4(), name: 'إلكترونيات' },
        { id: uuidv4(), name: 'اخرى' }
      ],
      products: [],
      customers: [
        {
          id: '3',
          name: 'سالم العميل',
          phone: 'customer',
          address: '',
          createdAt: new Date().toISOString()
        }
      ],
      contracts: [],
      payments: [],
      notifications: [],
      expenses: [],
      theme: 'light',
      isAuthenticated: false,

      // Expenses Actions
      addExpense: (expense) => set((state) => ({
        expenses: [{ ...expense, id: uuidv4() }, ...state.expenses]
      })),

      updateExpense: (id, data) => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, ...data } : e)
      })),

      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      // User Actions
      addUser: (user) => set((state) => {
        const id = uuidv4();
        const newUser: User = {
          ...user,
          id,
          createdAt: new Date().toISOString()
        };
        const updates: Partial<AppState> = {
          users: [...state.users, newUser]
        };
        
        if (user.role === 'customer') {
          updates.customers = [...state.customers, {
            id,
            name: user.name,
            phone: user.username,
            address: '',
            createdAt: newUser.createdAt
          }];
        }
        
        return updates;
      }),

      updateUser: (id, data) => set((state) => {
        const updates: Partial<AppState> = {
          users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
        };
        
        const user = state.users.find(u => u.id === id);
        if (user?.role === 'customer' || data.role === 'customer') {
          const customerExists = state.customers.some(c => c.id === id);
          if (customerExists) {
            updates.customers = state.customers.map(c => 
              c.id === id ? { ...c, name: data.name ?? c.name, phone: data.username ?? c.phone } : c
            );
          } else if (data.role === 'customer') {
            updates.customers = [...state.customers, {
              id,
              name: data.name ?? user.name,
              phone: data.username ?? user.username,
              address: '',
              createdAt: user?.createdAt || new Date().toISOString()
            }];
          }
        }
        
        return updates;
      }),

      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id),
        customers: state.customers.filter(c => c.id !== id)
      })),

      login: (user) => set({ isAuthenticated: true, currentUser: user }),
      logout: () => set({ isAuthenticated: false, currentUser: null }),

      setTheme: (theme) => set({ theme }),

      addProductCategory: (category) => set((state) => ({
        productCategories: [...state.productCategories, { ...category, id: uuidv4() }]
      })),

      updateProductCategory: (id, data) => set((state) => ({
        productCategories: state.productCategories.map(c => c.id === id ? { ...c, ...data } : c)
      })),

      deleteProductCategory: (id) => set((state) => ({
        productCategories: state.productCategories.filter(c => c.id !== id)
      })),

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

      addCustomer: (customer) => set((state) => {
        const id = uuidv4();
        const newCustomer = {
          ...customer,
          id,
          createdAt: new Date().toISOString()
        };
        const newUser: User = {
          id,
          name: customer.name,
          username: customer.phone,
          password: 'password', // Default password for customer
          role: 'customer',
          isActive: true,
          createdAt: newCustomer.createdAt
        };
        return {
          customers: [...state.customers, newCustomer],
          users: [...state.users, newUser]
        };
      }),

      updateCustomer: (id, data) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c),
        users: state.users.map(u => u.id === id ? { ...u, name: data.name ?? u.name, username: data.phone ?? u.username } : u)
      })),

      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id),
        users: state.users.filter(u => u.id !== id)
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
        users: [
          {
            id: '1',
            name: 'مدير النظام',
            username: 'admin',
            password: 'password', // Reset completely
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'أحمد التاجر',
            username: 'merchant',
            password: 'password',
            role: 'merchant',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'سالم العميل',
            username: 'customer',
            password: 'password',
            role: 'customer',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ],
        currentUser: null,
        isAuthenticated: false,
        products: [],
        customers: [
          {
            id: '3',
            name: 'سالم العميل',
            phone: 'customer',
            address: '',
            createdAt: new Date().toISOString()
          }
        ],
        contracts: [],
        payments: [],
        notifications: []
      }),

      resetPartially: (flags) => set((state) => {
        const updates: Partial<AppState> = {};
        if (flags.contracts) updates.contracts = [];
        if (flags.payments) updates.payments = [];
        if (flags.notifications) updates.notifications = [];
        if (flags.inventory) updates.products = [];
        // Note: customers are kept since it wasn't requested to reset them granularly, but could be added
        return updates;
      })
    }),
    {
      name: 'installment-store',
    }
  )
);
