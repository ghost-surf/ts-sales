import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Client,
  Category,
  Product,
  Service,
  Tax,
  AppDocument,
  Payment,
  UnitType,
  DocumentStatus,
  CompanySettings,
  StockMovement,
  CreditNote,
  PaymentMethod,
} from "@/types";

// ---- Raw API shapes -> frontend-friendly shapes -------------------------

interface RawCategory {
  id: string;
  name: string;
  unit: UnitType;
  createdAt: string;
}

interface RawProduct {
  id: string;
  categoryId: string;
  category: RawCategory;
  name: string;
  description?: string | null;
  price: number;
  stockQty: number;
  lowStockThreshold: number;
  unit: UnitType;
  createdAt: string;
}

interface RawService {
  id: string;
  categoryId: string;
  category: RawCategory;
  name: string;
  price: number;
  createdAt: string;
}

function mapCategory(raw: RawCategory): Category {
  return { id: raw.id, name: raw.name, unit: raw.unit, createdAt: raw.createdAt };
}

function mapProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    categoryId: raw.categoryId,
    category: raw.category?.name ?? "",
    name: raw.name,
    description: raw.description,
    price: raw.price,
    stock: raw.stockQty,
    lowStockThreshold: raw.lowStockThreshold,
    unit: raw.unit,
    createdAt: raw.createdAt,
  };
}

function mapService(raw: RawService): Service {
  return {
    id: raw.id,
    categoryId: raw.categoryId,
    category: raw.category?.name ?? "",
    name: raw.name,
    price: raw.price,
    createdAt: raw.createdAt,
  };
}

function mapDocument(raw: any): AppDocument {
  return {
    id: raw.id,
    type: raw.type,
    code: raw.code,
    clientId: raw.clientId,
    clientName: raw.client?.name ?? "",
    operatorId: raw.operatorId,
    subtotalProducts: raw.subtotalProducts,
    subtotalServices: raw.subtotalServices,
    discountApplied: raw.discountApplied,
    vatApplied: raw.vatApplied,
    discountValue: raw.discountValue,
    vatValue: raw.vatValue,
    total: raw.total,
    status: raw.status,
    displayStatus: raw.displayStatus ?? raw.status,
    dueDate: raw.dueDate,
    items: raw.items ?? [],
    paidAmount: raw.paidAmount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    creditNote: raw.creditNote ?? null,
  };
}

// ---- Context shape --------------------------------------------------------

interface CreateDocumentItemInput {
  itemType: "product" | "service";
  itemId: string;
  quantity: number;
}

interface CreateDocumentInput {
  clientId: string;
  items: CreateDocumentItemInput[];
  vatApplied: boolean;
  taxPercentage: number;
  discountValue?: number;
  dueDate?: string;
}

interface CreatePaymentInput {
  method: PaymentMethod;
  chequeNumber?: string;
  allocations: Array<{ documentId: string; amount: number }>;
}

interface DataContextType {
  loading: boolean;

  users: User[];
  addUser: (user: { name: string; email: string; password: string; role: "admin" | "operador" }) => Promise<User>;
  updateUser: (id: string, user: Partial<{ name: string; email: string; password: string; role: "admin" | "operador" }>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => Promise<Client>;
  updateClient: (id: string, client: Partial<Omit<Client, "id" | "createdAt">>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;

  categories: Category[];
  addCategory: (category: Omit<Category, "id" | "createdAt">) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "createdAt">>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt" | "category">) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Omit<Product, "id" | "createdAt" | "category">>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;

  services: Service[];
  addService: (service: Omit<Service, "id" | "createdAt" | "category">) => Promise<Service>;
  updateService: (id: string, service: Partial<Omit<Service, "id" | "createdAt" | "category">>) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;

  taxes: Tax[];
  addTax: (tax: Omit<Tax, "id">) => Promise<Tax>;
  updateTax: (id: string, tax: Partial<Omit<Tax, "id">>) => Promise<Tax>;
  deleteTax: (id: string) => Promise<void>;

  documents: AppDocument[];
  createInvoice: (input: CreateDocumentInput) => Promise<AppDocument>;
  createQuotation: (input: CreateDocumentInput) => Promise<AppDocument>;
  convertQuotationToInvoice: (quotationId: string) => Promise<AppDocument>;
  updateDocumentStatus: (id: string, status: DocumentStatus) => Promise<AppDocument>;
  fetchDocument: (id: string) => Promise<AppDocument>;
  getInvoices: () => AppDocument[];
  getQuotations: () => AppDocument[];

  payments: Payment[];
  registerPayment: (input: CreatePaymentInput) => Promise<Payment>;
  fetchPayment: (id: string) => Promise<Payment>;

  companySettings: CompanySettings | null;
  updateCompanySettings: (data: Partial<Omit<CompanySettings, "id" | "updatedAt">>) => Promise<CompanySettings>;

  stockMovements: StockMovement[];
  refreshStockMovements: () => Promise<void>;

  creditNotes: CreditNote[];
  createCreditNote: (documentId: string, reason?: string) => Promise<CreditNote>;
  fetchCreditNote: (id: string) => Promise<CreditNote>;

  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);

  const refreshClients = useCallback(async () => setClients(await api.get<Client[]>("/clients")), []);
  const refreshCategories = useCallback(
    async () => setCategories((await api.get<RawCategory[]>("/categories")).map(mapCategory)),
    []
  );
  const refreshProducts = useCallback(
    async () => setProducts((await api.get<RawProduct[]>("/products")).map(mapProduct)),
    []
  );
  const refreshServices = useCallback(
    async () => setServices((await api.get<RawService[]>("/services")).map(mapService)),
    []
  );
  const refreshTaxes = useCallback(async () => setTaxes(await api.get<Tax[]>("/taxes")), []);
  const refreshDocuments = useCallback(
    async () => setDocuments((await api.get<any[]>("/documents")).map(mapDocument)),
    []
  );
  const refreshPayments = useCallback(async () => setPayments(await api.get<Payment[]>("/payments")), []);
  const refreshUsers = useCallback(async () => setUsers(await api.get<User[]>("/users")), []);
  const refreshCompanySettings = useCallback(
    async () => setCompanySettings(await api.get<CompanySettings>("/settings")),
    []
  );
  const refreshStockMovements = useCallback(
    async () => setStockMovements(await api.get<StockMovement[]>("/stock-movements")),
    []
  );
  const refreshCreditNotes = useCallback(
    async () => setCreditNotes(await api.get<CreditNote[]>("/credit-notes")),
    []
  );

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const tasks = [
        refreshClients(),
        refreshCategories(),
        refreshProducts(),
        refreshServices(),
        refreshTaxes(),
        refreshDocuments(),
        refreshPayments(),
        refreshCompanySettings(),
        refreshCreditNotes(),
      ];
      if (user?.role === "admin") {
        tasks.push(refreshUsers());
        tasks.push(refreshStockMovements());
      }
      await Promise.allSettled(tasks);
    } finally {
      setLoading(false);
    }
  }, [
    user?.role,
    refreshClients,
    refreshCategories,
    refreshProducts,
    refreshServices,
    refreshTaxes,
    refreshDocuments,
    refreshPayments,
    refreshCompanySettings,
    refreshCreditNotes,
    refreshUsers,
    refreshStockMovements,
  ]);

  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setUsers([]);
      setClients([]);
      setCategories([]);
      setProducts([]);
      setServices([]);
      setTaxes([]);
      setDocuments([]);
      setPayments([]);
      setCompanySettings(null);
      setStockMovements([]);
      setCreditNotes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ---- Users ----
  const addUser: DataContextType["addUser"] = async (data) => {
    const created = await api.post<User>("/users", data);
    await refreshUsers();
    return created;
  };
  const updateUser: DataContextType["updateUser"] = async (id, data) => {
    const updated = await api.patch<User>(`/users/${id}`, data);
    await refreshUsers();
    return updated;
  };
  const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
    await refreshUsers();
  };

  // ---- Clients ----
  const addClient: DataContextType["addClient"] = async (data) => {
    const created = await api.post<Client>("/clients", data);
    await refreshClients();
    return created;
  };
  const updateClient: DataContextType["updateClient"] = async (id, data) => {
    const updated = await api.patch<Client>(`/clients/${id}`, data);
    await refreshClients();
    return updated;
  };
  const deleteClient = async (id: string) => {
    await api.delete(`/clients/${id}`);
    await refreshClients();
  };

  // ---- Categories ----
  const addCategory: DataContextType["addCategory"] = async (data) => {
    const created = mapCategory(await api.post<RawCategory>("/categories", data));
    await refreshCategories();
    return created;
  };
  const updateCategory: DataContextType["updateCategory"] = async (id, data) => {
    const updated = mapCategory(await api.patch<RawCategory>(`/categories/${id}`, data));
    await refreshCategories();
    return updated;
  };
  const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`);
    await refreshCategories();
  };

  // ---- Products ----
  const addProduct: DataContextType["addProduct"] = async (data) => {
    const created = mapProduct(
      await api.post<RawProduct>("/products", {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        stockQty: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        unit: data.unit,
      })
    );
    await Promise.allSettled([refreshProducts(), refreshStockMovements()]);
    return created;
  };
  const updateProduct: DataContextType["updateProduct"] = async (id, data) => {
    const payload: Record<string, unknown> = { ...data };
    if (data.stock !== undefined) {
      payload.stockQty = data.stock;
      delete payload.stock;
    }
    const updated = mapProduct(await api.patch<RawProduct>(`/products/${id}`, payload));
    await Promise.allSettled([refreshProducts(), refreshStockMovements()]);
    return updated;
  };
  const deleteProduct = async (id: string) => {
    await api.delete(`/products/${id}`);
    await refreshProducts();
  };

  // ---- Services ----
  const addService: DataContextType["addService"] = async (data) => {
    const created = mapService(await api.post<RawService>("/services", data));
    await refreshServices();
    return created;
  };
  const updateService: DataContextType["updateService"] = async (id, data) => {
    const updated = mapService(await api.patch<RawService>(`/services/${id}`, data));
    await refreshServices();
    return updated;
  };
  const deleteService = async (id: string) => {
    await api.delete(`/services/${id}`);
    await refreshServices();
  };

  // ---- Taxes ----
  const addTax: DataContextType["addTax"] = async (data) => {
    const created = await api.post<Tax>("/taxes", data);
    await refreshTaxes();
    return created;
  };
  const updateTax: DataContextType["updateTax"] = async (id, data) => {
    const updated = await api.patch<Tax>(`/taxes/${id}`, data);
    await refreshTaxes();
    return updated;
  };
  const deleteTax = async (id: string) => {
    await api.delete(`/taxes/${id}`);
    await refreshTaxes();
  };

  // ---- Documents ----
  const refreshStockSideEffects = () => {
    const tasks = [refreshDocuments(), refreshProducts()];
    if (user?.role === "admin") tasks.push(refreshStockMovements());
    return Promise.allSettled(tasks);
  };

  const createInvoice = async (input: CreateDocumentInput) => {
    const created = mapDocument(
      await api.post("/documents", { type: "FACT", status: "issued", discountValue: 0, ...input })
    );
    await refreshStockSideEffects();
    return created;
  };
  const createQuotation = async (input: CreateDocumentInput) => {
    const created = mapDocument(
      await api.post("/documents", { type: "COT", status: "issued", discountValue: 0, ...input })
    );
    await refreshDocuments();
    return created;
  };
  const convertQuotationToInvoice = async (quotationId: string) => {
    const created = mapDocument(await api.post(`/documents/${quotationId}/convert-to-invoice`));
    await refreshStockSideEffects();
    return created;
  };
  const updateDocumentStatus = async (id: string, status: DocumentStatus) => {
    const updated = mapDocument(await api.patch(`/documents/${id}/status`, { status }));
    await refreshStockSideEffects();
    return updated;
  };
  const fetchDocument = async (id: string) => mapDocument(await api.get(`/documents/${id}`));
  const getInvoices = () => documents.filter((d) => d.type === "FACT");
  const getQuotations = () => documents.filter((d) => d.type === "COT");

  // ---- Payments ----
  const registerPayment = async (input: CreatePaymentInput) => {
    const created = await api.post<Payment>("/payments", input);
    await Promise.allSettled([refreshPayments(), refreshDocuments()]);
    return created;
  };
  const fetchPayment = async (id: string) => api.get<Payment>(`/payments/${id}`);

  // ---- Credit notes ----
  const createCreditNote = async (documentId: string, reason?: string) => {
    const created = await api.post<CreditNote>("/credit-notes", { documentId, reason });
    const tasks = [refreshDocuments(), refreshProducts(), refreshPayments(), refreshCreditNotes()];
    if (user?.role === "admin") tasks.push(refreshStockMovements());
    await Promise.allSettled(tasks);
    return created;
  };
  const fetchCreditNote = async (id: string) => api.get<CreditNote>(`/credit-notes/${id}`);

  // ---- Company settings ----
  const updateCompanySettings: DataContextType["updateCompanySettings"] = async (data) => {
    const updated = await api.patch<CompanySettings>("/settings", data);
    setCompanySettings(updated);
    return updated;
  };

  return (
    <DataContext.Provider
      value={{
        loading,
        users,
        addUser,
        updateUser,
        deleteUser,
        clients,
        addClient,
        updateClient,
        deleteClient,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        services,
        addService,
        updateService,
        deleteService,
        taxes,
        addTax,
        updateTax,
        deleteTax,
        documents,
        createInvoice,
        createQuotation,
        convertQuotationToInvoice,
        updateDocumentStatus,
        fetchDocument,
        getInvoices,
        getQuotations,
        payments,
        registerPayment,
        fetchPayment,
        companySettings,
        updateCompanySettings,
        stockMovements,
        refreshStockMovements,
        creditNotes,
        createCreditNote,
        fetchCreditNote,
        refreshAll,
      }}
    >
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
