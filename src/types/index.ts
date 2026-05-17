export type InstallmentType = 'daily' | 'weekly' | 'monthly';
export type ContractStatus = 'active' | 'completed' | 'archived';
export type InstallmentStatus = 'pending' | 'paid' | 'late';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category: string;
  status: 'available' | 'out_of_stock';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Installment {
  id: string;
  contractId: string;
  number: number;
  type: InstallmentType;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: InstallmentStatus;
}

export interface Contract {
  id: string;
  customerId: string;
  productId: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  installmentType: InstallmentType;
  installmentsCount: number;
  startDate: string;
  status: ContractStatus;
  installments: Installment[];
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  contractId: string;
  installmentId: string;
  customerId: string;
  amount: number;
  date: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'due' | 'late' | 'payment' | 'completed';
  read: boolean;
  date: string;
  relatedId?: string;
}
