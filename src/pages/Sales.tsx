import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  ShoppingCart,
  FileText,
  User,
  Package,
  Wrench,
  Calculator,
  Search,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { ApiError } from "@/lib/api";
import { normalizeSearch } from "@/lib/utils";

interface SaleItem {
  id: number;
  itemType: "product" | "service";
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export default function Sales() {
  const { toast } = useToast();
  const { clients, products, services, categories, taxes, addClient, createInvoice, createQuotation } = useData();

  const [documentType, setDocumentType] = useState<"invoice" | "quotation">("invoice");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [selectedTaxId, setSelectedTaxId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("all");
  const [serviceCategoryId, setServiceCategoryId] = useState("all");

  // New client form
  const [newClient, setNewClient] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });

  const activeTax = taxes.find((t) => t.id === selectedTaxId) ?? taxes[0];

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          normalizeSearch(p.name).includes(normalizeSearch(productSearch)) &&
          (productCategoryId === "all" || p.categoryId === productCategoryId)
      ),
    [products, productSearch, productCategoryId]
  );
  const filteredServices = useMemo(
    () =>
      services.filter(
        (s) =>
          normalizeSearch(s.name).includes(normalizeSearch(serviceSearch)) &&
          (serviceCategoryId === "all" || s.categoryId === serviceCategoryId)
      ),
    [services, serviceSearch, serviceCategoryId]
  );

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
      const created = await addClient(newClient);
      setSelectedClient(created.id);
      setNewClient({ name: "", address: "", phone: "", email: "" });
      setShowNewClientForm(false);

      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro ao salvar cliente",
        variant: "destructive",
      });
    }
  };

  // Calculations
  const subtotalProducts = items
    .filter(item => item.itemType === "product")
    .reduce((sum, item) => sum + item.lineTotal, 0);

  const subtotalServices = items
    .filter(item => item.itemType === "service")
    .reduce((sum, item) => sum + item.lineTotal, 0);

  const subtotal = subtotalProducts + subtotalServices;
  const discountValue = discountEnabled ? subtotal * 0.1 : 0;
  const taxableAmount = subtotal - discountValue;
  const taxPercentage = activeTax?.percentage ?? 0;
  const vatAmount = vatEnabled ? taxableAmount * (taxPercentage / 100) : 0;
  const total = taxableAmount + vatAmount;

  const addProductItem = (product: (typeof products)[number], quantity: number) => {
    if (quantity <= 0) return;
    if (documentType === "invoice" && quantity > product.stock) {
      toast({
        title: "Erro",
        description: "Quantidade excede o stock disponível!",
        variant: "destructive",
      });
      return;
    }

    setItems([...items, {
      id: Date.now(),
      itemType: "product",
      itemId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    }]);
  };

  const addServiceItem = (service: (typeof services)[number]) => {
    setItems([...items, {
      id: Date.now(),
      itemType: "service",
      itemId: service.id,
      name: service.name,
      unitPrice: service.price,
      quantity: 1,
      lineTotal: service.price,
    }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSaveDocument = async () => {
    if (!selectedClient || items.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e adicione pelo menos um item",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const input = {
        clientId: selectedClient,
        items: items.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        vatApplied: vatEnabled,
        taxPercentage,
        discountValue,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const created = documentType === "invoice" ? await createInvoice(input) : await createQuotation(input);

      toast({
        title: documentType === "invoice" ? "Fatura criada!" : "Cotação criada!",
        description: `Documento ${created.code} criado com sucesso.`
      });

      setSelectedClient(null);
      setItems([]);
      setShowNewClientForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro ao salvar documento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Criar novas faturas e cotações</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Document Type + Client, side by side */}
            <Card>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de Documento</Label>
                  <Tabs value={documentType} onValueChange={(value: any) => setDocumentType(value)} className="mt-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="invoice" className="flex items-center space-x-1.5">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Faturação</span>
                      </TabsTrigger>
                      <TabsTrigger value="quotation" className="flex items-center space-x-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Cotação</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Cliente
                  </Label>
                  {!showNewClientForm ? (
                    <div className="flex gap-2 mt-1">
                      <Select value={selectedClient || ""} onValueChange={setSelectedClient}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => setShowNewClientForm(true)} title="Novo Cliente">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-1 p-3 border rounded-lg">
                      <Input
                        placeholder="Nome do cliente"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={newClient.email}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        />
                        <Input
                          placeholder="Telefone"
                          value={newClient.phone}
                          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        />
                      </div>
                      <Textarea
                        placeholder="Endereço"
                        rows={2}
                        value={newClient.address}
                        onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveNewClient}>Guardar</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowNewClientForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedClient && !showNewClientForm && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {clients.find((c) => c.id === selectedClient)?.email}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items Selection */}
            <Card>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">Itens da Venda</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="products">
                  <TabsList>
                    <TabsTrigger value="products" className="flex items-center space-x-1.5">
                      <Package className="h-3.5 w-3.5" />
                      <span>Produtos</span>
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center space-x-1.5">
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Serviços</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="products" className="space-y-2 mt-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar produto..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                      <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                        <SelectTrigger className="w-40 h-8 text-sm">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas Categorias</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <ScrollArea className="h-56 rounded-md border">
                      <div className="space-y-1 p-2">
                        {filteredProducts.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-6">Nenhum produto encontrado</p>
                        )}
                        {filteredProducts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                                  {product.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {product.price.toFixed(2)} MTN · Stock: {product.stock} {product.unit}
                              </p>
                            </div>
                            <Input
                              type="number"
                              placeholder="Qtd"
                              className="w-16 h-8 text-sm ml-2"
                              min="1"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const quantity = Number((e.target as HTMLInputElement).value);
                                  addProductItem(product, quantity);
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-2 mt-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar serviço..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                      <Select value={serviceCategoryId} onValueChange={setServiceCategoryId}>
                        <SelectTrigger className="w-40 h-8 text-sm">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas Categorias</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <ScrollArea className="h-56 rounded-md border">
                      <div className="space-y-1 p-2">
                        {filteredServices.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-6">Nenhum serviço encontrado</p>
                        )}
                        {filteredServices.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium truncate">{service.name}</p>
                                <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                                  {service.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{service.price.toFixed(2)} MTN</p>
                            </div>
                            <Button size="sm" className="h-8 w-8 p-0 ml-2" onClick={() => addServiceItem(service)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Selected Items */}
            {items.length > 0 && (
              <Card>
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-base">Itens Selecionados</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className={items.length > 4 ? "h-48" : ""}>
                    <div className="space-y-1.5 pr-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-md">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.unitPrice.toFixed(2)} MTN
                              {item.itemType === "product" && ` x ${item.quantity}`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-sm font-medium">{item.lineTotal.toFixed(2)} MTN</span>
                            <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => removeItem(item.id)}>
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Card */}
          <div>
            <Card className="sticky top-4">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Resumo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produtos:</span>
                    <span>{subtotalProducts.toFixed(2)} MTN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviços:</span>
                    <span>{subtotalServices.toFixed(2)} MTN</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>{subtotal.toFixed(2)} MTN</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="discount-toggle">Desconto (10%)</Label>
                  <Switch id="discount-toggle" checked={discountEnabled} onCheckedChange={setDiscountEnabled} />
                </div>

                {discountEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span>-{discountValue.toFixed(2)} MTN</span>
                  </div>
                )}

                {taxes.length > 0 && (
                  <div>
                    <Label htmlFor="tax-select" className="text-xs text-muted-foreground">Imposto</Label>
                    <Select value={activeTax?.id ?? ""} onValueChange={setSelectedTaxId}>
                      <SelectTrigger id="tax-select" className="h-8 text-sm">
                        <SelectValue placeholder="Selecionar imposto" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxes.map((tax) => (
                          <SelectItem key={tax.id} value={tax.id}>
                            {tax.name} ({tax.percentage}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="vat-toggle">
                    {activeTax ? `${activeTax.name} (${activeTax.percentage}%)` : "Imposto"}
                  </Label>
                  <Switch id="vat-toggle" checked={vatEnabled} onCheckedChange={setVatEnabled} disabled={!activeTax} />
                </div>

                {vatEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Imposto:</span>
                    <span>{vatAmount.toFixed(2)} MTN</span>
                  </div>
                )}

                <hr className="border-t-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} MTN</span>
                </div>

                <Button
                  onClick={handleSaveDocument}
                  className="w-full"
                  disabled={!selectedClient || items.length === 0 || saving}
                >
                  {saving ? "A guardar..." : documentType === "invoice" ? "Criar Fatura" : "Criar Cotação"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
