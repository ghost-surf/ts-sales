export type UserRole = "admin" | "operador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  nuit?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
}

export type UnitType = "metros" | "pcs";

export interface Category {
  id: string;
  name: string;
  unit: UnitType;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  category: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  lowStockThreshold: number;
  unit: UnitType;
  createdAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  category: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
}

export type DocumentType = "FACT" | "COT";
export type DocumentStatus = "draft" | "issued" | "paid" | "canceled" | "accepted" | "rejected";
export type DisplayStatus = DocumentStatus | "overdue" | "expired";

export interface DocumentItem {
  id: string;
  itemType: "product" | "service";
  itemId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  unit?: UnitType | null;
  lineTotal: number;
}

export interface AppDocument {
  id: string;
  type: DocumentType;
  code: string;
  clientId: string;
  clientName: string;
  operatorId: string;
  subtotalProducts: number;
  subtotalServices: number;
  discountApplied: boolean;
  vatApplied: boolean;
  discountValue: number;
  vatValue: number;
  total: number;
  status: DocumentStatus;
  displayStatus: DisplayStatus;
  dueDate?: string | null;
  items: DocumentItem[];
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAllocation {
  documentId: string;
  amount: number;
  document?: { id: string; code: string; type: DocumentType; total: number; clientId: string };
}

export interface Payment {
  id: string;
  receiptCode: string;
  paymentDate: string;
  method: "numerario" | "cheque";
  chequeNumber?: string | null;
  amount: number;
  operatorId: string;
  operator?: { id: string; name: string; email: string };
  documents: PaymentAllocation[];
}
