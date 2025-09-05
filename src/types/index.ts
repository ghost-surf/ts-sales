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
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
}

export interface InvoiceItem {
  id: string;
  type: "product" | "service";
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  status: "Paga" | "Pendente" | "Vencida";
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  type: "invoice";
}

export interface Quotation {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  validUntil: string;
  status: "Pendente" | "Aceite" | "Rejeitada" | "Expirada";
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  type: "quotation";
}

export type Document = Invoice | Quotation;