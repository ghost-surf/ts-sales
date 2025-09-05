import { User, Client, Category, Product, Service, Tax, Invoice, Quotation } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@hydrostock.com",
    role: "admin",
    createdAt: "2025-01-01T10:00:00Z"
  },
  {
    id: "2", 
    name: "Maria Santos",
    email: "maria@hydrostock.com",
    role: "operador",
    createdAt: "2025-01-15T10:00:00Z"
  }
];

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Construções Silva Lda",
    address: "Rua das Construções, 123, Maputo",
    phone: "+258 84 123 4567",
    email: "silva@construcoes.co.mz",
    createdAt: "2025-01-10T10:00:00Z"
  },
  {
    id: "2",
    name: "Metalúrgica Santos",
    address: "Av. Julius Nyerere, 456, Maputo",
    phone: "+258 84 987 6543", 
    email: "santos@metalurgica.co.mz",
    createdAt: "2025-01-12T10:00:00Z"
  },
  {
    id: "3",
    name: "Oficina João & Filhos",
    address: "Rua da Oficina, 789, Matola",
    phone: "+258 84 555 1234",
    email: "joao@oficina.co.mz",
    createdAt: "2025-01-20T10:00:00Z"
  }
];

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Tubagem PVC",
    description: "Tubos e conexões em PVC",
    createdAt: "2025-01-01T10:00:00Z"
  },
  {
    id: "2", 
    name: "Bombas de Água",
    description: "Bombas centrífugas e submersíveis",
    createdAt: "2025-01-01T10:00:00Z"
  },
  {
    id: "3",
    name: "Acessórios",
    description: "Válvulas, registos e outros acessórios",
    createdAt: "2025-01-01T10:00:00Z"
  }
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Tubo PVC 50mm",
    categoryId: "1",
    category: "Tubagem PVC",
    price: 25.50,
    stock: 150,
    description: "Tubo PVC 50mm x 6m",
    createdAt: "2025-01-05T10:00:00Z"
  },
  {
    id: "2",
    name: "Joelho PVC 50mm", 
    categoryId: "1",
    category: "Tubagem PVC",
    price: 8.50,
    stock: 200,
    description: "Joelho PVC 50mm 90°",
    createdAt: "2025-01-05T10:00:00Z"
  },
  {
    id: "3",
    name: "Bomba 1HP Centrífuga",
    categoryId: "2", 
    category: "Bombas de Água",
    price: 450.00,
    stock: 15,
    description: "Bomba centrífuga 1HP monofásica",
    createdAt: "2025-01-08T10:00:00Z"
  }
];

export const mockServices: Service[] = [
  {
    id: "1",
    name: "Instalação de Bomba",
    price: 150.00,
    description: "Serviço completo de instalação de bomba de água",
    createdAt: "2025-01-01T10:00:00Z"
  },
  {
    id: "2",
    name: "Manutenção Preventiva",
    price: 75.00,
    description: "Serviço de manutenção preventiva em bombas",
    createdAt: "2025-01-01T10:00:00Z"
  }
];

export const mockTaxes: Tax[] = [
  {
    id: "1",
    name: "IVA",
    percentage: 17
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "FACT-0023/25",
    clientId: "1", 
    clientName: "Construções Silva Lda",
    date: "2025-01-31",
    dueDate: "2025-02-15",
    status: "Paga",
    items: [
      {
        id: "1",
        type: "product",
        itemId: "1",
        name: "Tubo PVC 50mm",
        quantity: 10,
        unitPrice: 25.50,
        total: 255.00
      },
      {
        id: "2", 
        type: "product",
        itemId: "2",
        name: "Joelho PVC 50mm",
        quantity: 15,
        unitPrice: 8.50,
        total: 127.50
      }
    ],
    subtotal: 382.50,
    taxAmount: 0.00,
    total: 382.50,
    type: "invoice"
  }
];

export const mockQuotations: Quotation[] = [
  {
    id: "COT-0015/25",
    clientId: "2",
    clientName: "Metalúrgica Santos", 
    date: "2025-01-31",
    validUntil: "2025-02-15",
    status: "Pendente",
    items: [
      {
        id: "1",
        type: "product",
        itemId: "3",
        name: "Bomba 1HP Centrífuga", 
        quantity: 1,
        unitPrice: 450.00,
        total: 450.00
      },
      {
        id: "2",
        type: "service", 
        itemId: "1",
        name: "Instalação de Bomba",
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00
      }
    ],
    subtotal: 600.00,
    taxAmount: 0.00,
    total: 600.00,
    type: "quotation"
  }
];