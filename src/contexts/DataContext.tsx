import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  User, Client, Category, Product, Service, Tax, Invoice, Quotation, Document 
} from "@/types";
import {
  mockUsers, mockClients, mockCategories, mockProducts, 
  mockServices, mockTaxes, mockInvoices, mockQuotations
} from "@/data/mockData";

interface DataContextType {
  // Users
  users: User[];
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, "id" | "createdAt">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;
  
  // Services
  services: Service[];
  addService: (service: Omit<Service, "id" | "createdAt">) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  // Taxes
  taxes: Tax[];
  addTax: (tax: Omit<Tax, "id">) => void;
  updateTax: (id: string, tax: Partial<Tax>) => void;
  deleteTax: (id: string) => void;
  
  // Documents (Invoices & Quotations)
  documents: Document[];
  addInvoice: (invoice: Omit<Invoice, "id">) => void;
  addQuotation: (quotation: Omit<Quotation, "id">) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteDocument: (id: string) => void;
  convertQuotationToInvoice: (quotationId: string) => void;
  
  // Getters
  getInvoices: () => Invoice[];
  getQuotations: () => Quotation[];
  getDocument: (id: string) => Document | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [taxes, setTaxes] = useState<Tax[]>(mockTaxes);
  const [documents, setDocuments] = useState<Document[]>([...mockInvoices, ...mockQuotations]);

  const generateId = () => Math.random().toString(36).substring(7);

  // Users
  const addUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...userData } : user));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // Clients
  const addClient = (clientData: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => prev.map(client => client.id === id ? { ...client, ...clientData } : client));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, "id" | "createdAt">) => {
    const newCategory: Category = {
      ...categoryData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...categoryData } : cat));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Products
  const addProduct = (productData: Omit<Product, "id" | "createdAt">) => {
    const category = categories.find(c => c.id === productData.categoryId);
    const newProduct: Product = {
      ...productData,
      category: category?.name || "",
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, ...productData };
        if (productData.categoryId) {
          const category = categories.find(c => c.id === productData.categoryId);
          updatedProduct.category = category?.name || "";
        }
        return updatedProduct;
      }
      return product;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const updateStock = (id: string, quantity: number) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, stock: product.stock - quantity } : product
    ));
  };

  // Services
  const addService = (serviceData: Omit<Service, "id" | "createdAt">) => {
    const newService: Service = {
      ...serviceData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices(prev => prev.map(service => service.id === id ? { ...service, ...serviceData } : service));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  // Taxes
  const addTax = (taxData: Omit<Tax, "id">) => {
    const newTax: Tax = {
      ...taxData,
      id: generateId()
    };
    setTaxes(prev => [...prev, newTax]);
  };

  const updateTax = (id: string, taxData: Partial<Tax>) => {
    setTaxes(prev => prev.map(tax => tax.id === id ? { ...tax, ...taxData } : tax));
  };

  const deleteTax = (id: string) => {
    setTaxes(prev => prev.filter(tax => tax.id !== id));
  };

  // Documents
  const addInvoice = (invoiceData: Omit<Invoice, "id">) => {
    const number = String(documents.filter(d => d.type === "invoice").length + 1).padStart(4, "0");
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `FACT-${number}/25`
    };
    setDocuments(prev => [...prev, newInvoice]);
  };

  const addQuotation = (quotationData: Omit<Quotation, "id">) => {
    const number = String(documents.filter(d => d.type === "quotation").length + 1).padStart(4, "0");
    const newQuotation: Quotation = {
      ...quotationData,
      id: `COT-${number}/25`
    };
    setDocuments(prev => [...prev, newQuotation]);
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id && doc.type === "invoice" ? { ...doc, ...invoiceData } : doc
    ));
  };

  const updateQuotation = (id: string, quotationData: Partial<Quotation>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id && doc.type === "quotation" ? { ...doc, ...quotationData } : doc
    ));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const convertQuotationToInvoice = (quotationId: string) => {
    const quotation = documents.find(d => d.id === quotationId && d.type === "quotation") as Quotation;
    if (!quotation) return;

    const invoiceNumber = String(documents.filter(d => d.type === "invoice").length + 1).padStart(4, "0");
    const newInvoice: Invoice = {
      id: `FACT-${invoiceNumber}/25`,
      clientId: quotation.clientId,
      clientName: quotation.clientName,
      date: quotation.date,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Pendente",
      items: quotation.items,
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      total: quotation.total,
      type: "invoice"
    };

    setDocuments(prev => [
      ...prev.map(doc => doc.id === quotationId && doc.type === "quotation" ? { ...doc, status: "Aceite" as const } : doc),
      newInvoice
    ]);

    // Update stock for products
    quotation.items.forEach(item => {
      if (item.type === "product") {
        updateStock(item.itemId, item.quantity);
      }
    });
  };

  // Getters
  const getInvoices = (): Invoice[] => documents.filter(d => d.type === "invoice") as Invoice[];
  const getQuotations = (): Quotation[] => documents.filter(d => d.type === "quotation") as Quotation[];
  const getDocument = (id: string): Document | undefined => documents.find(d => d.id === id);

  return (
    <DataContext.Provider value={{
      users, addUser, updateUser, deleteUser,
      clients, addClient, updateClient, deleteClient,
      categories, addCategory, updateCategory, deleteCategory,
      products, addProduct, updateProduct, deleteProduct, updateStock,
      services, addService, updateService, deleteService,
      taxes, addTax, updateTax, deleteTax,
      documents, addInvoice, addQuotation, updateInvoice, updateQuotation, deleteDocument, convertQuotationToInvoice,
      getInvoices, getQuotations, getDocument
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}