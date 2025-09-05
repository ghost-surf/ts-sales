import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ShoppingCart,
  FileText,
  User,
  Package,
  Wrench,
  Calculator,
} from "lucide-react";

// Types
interface Client {
  id: string;
  name: string;
  nuit?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_qty: number;
  unit: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

export default function Sales() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState<"invoice" | "quote">("invoice");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [vatEnabled, setVatEnabled] = useState(true);
  
  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New client form
  const [newClient, setNewClient] = useState({
    name: "",
    nuit: "",
    phone: "",
    email: "",
    address: ""
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, productsRes, servicesRes] = await Promise.all([
        supabase.from("clients").select("*"),
        supabase.from("products").select("*"),
        supabase.from("services").select("*")
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNewClient = async () => {
    if (!newClient.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([newClient])
        .select()
        .single();

      if (error) throw error;

      setClients([...clients, data]);
      setSelectedClient(data.id);
      setNewClient({ name: "", nuit: "", phone: "", email: "", address: "" });
      setShowNewClientForm(false);
      
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
      });
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente",
        variant: "destructive",
      });
    }
  };

  // Calculations
  const subtotalProducts = items
    .filter(item => item.type === "product")
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const subtotalServices = items
    .filter(item => item.type === "service")
    .reduce((sum, item) => sum + item.price, 0);
  
  const subtotal = subtotalProducts + subtotalServices;
  const discountAmount = discountEnabled ? subtotal * 0.1 : 0;
  const baseAfterDiscount = subtotal - discountAmount;
  const vatAmount = vatEnabled ? baseAfterDiscount * 0.16 : 0;
  const total = baseAfterDiscount + vatAmount;

  const addProductItem = (product: Product, quantity: number) => {
    if (quantity <= 0) return;
    if (documentType === "invoice" && quantity > product.stock_qty) {
      toast({
        title: "Erro",
        description: "Quantidade excede o stock disponível!",
        variant: "destructive",
      });
      return;
    }
    
    setItems([...items, {
      id: Date.now(),
      type: "product",
      itemId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      unit: product.unit,
      total: product.price * quantity,
    }]);
  };

  const addServiceItem = (service: Service) => {
    setItems([...items, {
      id: Date.now(),
      type: "service",
      itemId: service.id,
      name: service.name,
      price: service.price,
      total: service.price,
    }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
            <p className="text-muted-foreground">
              Criar novas faturas e cotações
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="invoice" className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Faturação</span>
                    </TabsTrigger>
                    <TabsTrigger value="quote" className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Cotação</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Cliente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showNewClientForm ? (
                  <div className="space-y-4">
                    <Select value={selectedClient || ""} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar cliente existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.nuit && `- NUIT ${client.nuit}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewClientForm(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientName">Nome do Cliente</Label>
                        <Input 
                          id="clientName" 
                          placeholder="Nome da empresa"
                          value={newClient.name}
                          onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientNuit">NUIT</Label>
                        <Input 
                          id="clientNuit" 
                          placeholder="400123456"
                          value={newClient.nuit}
                          onChange={(e) => setNewClient({...newClient, nuit: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientPhone">Telefone</Label>
                        <Input 
                          id="clientPhone" 
                          placeholder="+258 84 123 4567"
                          value={newClient.phone}
                          onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input 
                          id="clientEmail" 
                          type="email" 
                          placeholder="cliente@empresa.co.mz"
                          value={newClient.email}
                          onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="clientAddress">Endereço</Label>
                      <Textarea 
                        id="clientAddress" 
                        placeholder="Endereço completo"
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={saveNewClient}>Guardar Cliente</Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewClientForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Selected Client Card */}
                {selectedClient && !showNewClientForm && (
                  <div className="p-4 bg-muted/20 rounded-lg border">
                    {(() => {
                      const client = clients.find(c => c.id === selectedClient);
                      return client ? (
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          {client.nuit && <p className="text-sm text-muted-foreground">NUIT: {client.nuit}</p>}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Itens da Venda</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="products">
                  <TabsList>
                    <TabsTrigger value="products" className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Produtos</span>
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4" />
                      <span>Serviços</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="products" className="space-y-4">
                    <div className="space-y-3">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {product.price.toFixed(2)} MTN | Stock: {product.stock_qty} {product.unit}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Qtd"
                              className="w-20"
                              step={product.unit === "metros" ? "0.1" : "1"}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const quantity = Number((e.target as HTMLInputElement).value);
                                  addProductItem(product, quantity);
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }}
                            />
                            <span className="text-sm text-muted-foreground">{product.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="space-y-4">
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {service.price.toFixed(2)} MTN
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => addServiceItem(service)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Selected Items */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Itens Selecionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.price.toFixed(2)} MTN
                            {item.type === "product" && ` x ${item.quantity} ${item.unit}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.total.toFixed(2)} MTN</span>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Card */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Resumo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Produtos:</span>
                    <span>{subtotalProducts.toFixed(2)} MTN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Serviços:</span>
                    <span>{subtotalServices.toFixed(2)} MTN</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>{subtotal.toFixed(2)} MTN</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Desconto 10%</span>
                    <Switch 
                      checked={discountEnabled}
                      onCheckedChange={setDiscountEnabled}
                    />
                  </div>
                  {discountEnabled && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>Desconto:</span>
                      <span>-{discountAmount.toFixed(2)} MTN</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm">IVA 16%</span>
                    <Switch 
                      checked={vatEnabled}
                      onCheckedChange={setVatEnabled}
                    />
                  </div>
                  {vatEnabled && (
                    <div className="flex justify-between text-sm">
                      <span>IVA:</span>
                      <span>{vatAmount.toFixed(2)} MTN</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{total.toFixed(2)} MTN</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button 
                    className="w-full" 
                    disabled={!selectedClient || items.length === 0}
                  >
                    {documentType === "invoice" ? "Emitir Fatura" : "Criar Cotação"}
                  </Button>
                  <Button variant="outline" className="w-full">
                    Guardar Rascunho
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}