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

export type UnitType = "metros" | "pcs" | "kg" | "litros";

export type CategoryType = "product" | "service";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  unit?: UnitType | null;
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
  creditNote?: { id: string; code: string } | null;
}

export interface PaymentAllocation {
  documentId: string;
  amount: number;
  document?: { id: string; code: string; type: DocumentType; total: number; clientId: string };
}

export type PaymentMethod = "numerario" | "cheque" | "transferencia";

export interface Payment {
  id: string;
  receiptCode: string;
  paymentDate: string;
  method: PaymentMethod;
  chequeNumber?: string | null;
  amount: number;
  kind: "payment" | "reversal";
  operatorId: string;
  operator?: { id: string; name: string; email: string };
  documents: PaymentAllocation[];
}

export interface CompanySettings {
  id: string;
  name: string;
  address?: string | null;
  email?: string | null;
  nuit?: string | null;
  phone?: string | null;
  website?: string | null;
  logo?: string | null;
  bankName?: string | null;
  bankAccountHolder?: string | null;
  bankIban?: string | null;
  updatedAt: string;
}

export interface CreditNote {
  id: string;
  code: string;
  documentId: string;
  operatorId: string;
  total: number;
  reason?: string | null;
  createdAt: string;
  operator?: { id: string; name: string; email: string };
  document: {
    id: string;
    code: string;
    type: DocumentType;
    total: number;
    status: DocumentStatus;
    createdAt: string;
    client: { id: string; name: string; nuit?: string | null; email?: string | null; phone?: string | null; address?: string | null };
    items: DocumentItem[];
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  documentId?: string | null;
  operatorId?: string | null;
  type: "debit" | "credit";
  quantity: number;
  unit: UnitType;
  note?: string | null;
  createdAt: string;
  product: { id: string; name: string; unit: UnitType };
  operator?: { id: string; name: string; email: string } | null;
  document?: { id: string; code: string; type: DocumentType } | null;
}
