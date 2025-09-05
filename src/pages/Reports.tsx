import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Calendar,
  Download,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SalesReport {
  period: string;
  total_sales: number;
  orders_count: number;
  avg_order_value: number;
}

interface StockReport {
  product_name: string;
  category_name: string;
  current_stock: number;
  stock_value: number;
  status: 'ok' | 'low' | 'out';
}

interface TopClient {
  client_name: string;
  total_purchases: number;
  orders_count: number;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [stockData, setStockData] = useState<StockReport[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedReport, setSelectedReport] = useState("sales");

  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // Fetch sales data
      const salesQuery = supabase
        .from('documents')
        .select(`
          created_at,
          total,
          status
        `)
        .eq('status', 'paid')
        .gte('created_at', new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString());

      // Fetch stock data
      const stockQuery = supabase
        .from('products')
        .select(`
          name,
          stock_qty,
          price,
          low_stock_threshold,
          categories!inner(name)
        `);

      // Fetch clients data
      const clientsQuery = supabase
        .from('clients')
        .select(`
          id,
          name
        `);

      const [salesResponse, stockResponse, clientsResponse] = await Promise.all([
        salesQuery,
        stockQuery,
        clientsQuery
      ]);

      if (salesResponse.error) throw salesResponse.error;
      if (stockResponse.error) throw stockResponse.error;
      if (clientsResponse.error) throw clientsResponse.error;

      // Process sales data
      const salesByDay = salesResponse.data?.reduce((acc, sale) => {
        const date = new Date(sale.created_at).toLocaleDateString('pt-PT');
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 };
        }
        acc[date].total += sale.total;
        acc[date].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      const processedSalesData = Object.entries(salesByDay || {}).map(([period, data]) => ({
        period,
        total_sales: data.total,
        orders_count: data.count,
        avg_order_value: data.total / data.count,
      }));

      // Process stock data
      const processedStockData = stockResponse.data?.map(product => ({
        product_name: product.name,
        category_name: product.categories?.name || 'Sem categoria',
        current_stock: product.stock_qty,
        stock_value: product.stock_qty * product.price,
        status: (product.stock_qty <= 0 ? 'out' : 
                product.stock_qty <= product.low_stock_threshold ? 'low' : 'ok') as 'ok' | 'low' | 'out'
      })) || [];

      // Mock top clients data (in real app, this would be calculated from sales data)
      const mockTopClients = clientsResponse.data?.slice(0, 5).map((client, index) => ({
        client_name: client.name,
        total_purchases: Math.random() * 10000 + 1000,
        orders_count: Math.floor(Math.random() * 20) + 1,
      })) || [];

      setSalesData(processedSalesData);
      setStockData(processedStockData);
      setTopClients(mockTopClients);

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getTotalSales = () => {
    return salesData.reduce((sum, item) => sum + item.total_sales, 0);
  };

  const getTotalOrders = () => {
    return salesData.reduce((sum, item) => sum + item.orders_count, 0);
  };

  const getAverageOrderValue = () => {
    const total = getTotalSales();
    const orders = getTotalOrders();
    return orders > 0 ? total / orders : 0;
  };

  const getLowStockCount = () => {
    return stockData.filter(item => item.status === 'low' || item.status === 'out').length;
  };

  const getTotalStockValue = () => {
    return stockData.reduce((sum, item) => sum + item.stock_value, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">
              Análise de vendas, stock e performance do negócio
            </p>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{getTotalSales().toFixed(2)} MTN</p>
                  <p className="text-sm text-muted-foreground">Vendas Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{getTotalOrders()}</p>
                  <p className="text-sm text-muted-foreground">Total de Vendas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">{getAverageOrderValue().toFixed(2)} MTN</p>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-warning">{getLowStockCount()}</p>
                  <p className="text-sm text-muted-foreground">Alertas de Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Type Selector */}
        <div className="flex space-x-2">
          <Button 
            variant={selectedReport === "sales" ? "default" : "outline"}
            onClick={() => setSelectedReport("sales")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Vendas
          </Button>
          <Button 
            variant={selectedReport === "stock" ? "default" : "outline"}
            onClick={() => setSelectedReport("stock")}
          >
            <Package className="h-4 w-4 mr-2" />
            Stock
          </Button>
          <Button 
            variant={selectedReport === "clients" ? "default" : "outline"}
            onClick={() => setSelectedReport("clients")}
          >
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </Button>
        </div>

        {/* Sales Report */}
        {selectedReport === "sales" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Vendas por Período</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma venda encontrada no período selecionado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Vendas</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{item.orders_count}</TableCell>
                          <TableCell className="font-mono">{item.total_sales.toFixed(2)} MTN</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total de Vendas:</span>
                  <span className="font-bold">€{getTotalSales().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Número de Vendas:</span>
                  <span className="font-bold">{getTotalOrders()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ticket Médio:</span>
                  <span className="font-bold">€{getAverageOrderValue().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor Stock Total:</span>
                  <span className="font-bold">€{getTotalStockValue().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stock Report */}
        {selectedReport === "stock" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Relatório de Stock</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Stock Atual</TableHead>
                      <TableHead>Valor Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category_name}</Badge>
                        </TableCell>
                        <TableCell>{item.current_stock}</TableCell>
                        <TableCell className="font-mono">{item.stock_value.toFixed(2)} MTN</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              item.status === 'ok' ? 'secondary' : 
                              item.status === 'low' ? 'destructive' : 'destructive'
                            }
                            className={
                              item.status === 'ok' ? 'bg-success/10 text-success' : 
                              item.status === 'low' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                            }
                          >
                            {item.status === 'ok' ? 'OK' : item.status === 'low' ? 'Baixo' : 'Esgotado'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Clients Report */}
        {selectedReport === "clients" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Top Clientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total Compras</TableHead>
                      <TableHead>Nº Pedidos</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClients.map((client, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{client.client_name}</TableCell>
                        <TableCell className="font-mono">{client.total_purchases.toFixed(2)} MTN</TableCell>
                        <TableCell>{client.orders_count}</TableCell>
                        <TableCell className="font-mono">
                          {(client.total_purchases / client.orders_count).toFixed(2)} MTN
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}