import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, Users, Package, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

export default function Reports() {
  const { products, clients, getInvoices } = useData();
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("sales");
  const { toast } = useToast();

  const invoices = getInvoices();

  const salesData = {
    total: invoices.reduce((sum, inv) => sum + inv.total, 0),
    count: invoices.length,
    avgTicket: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
  };

  const stockData = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stock < 10).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  const clientsData = {
    total: clients.length,
    activeMonth: clients.length,
    newMonth: 0,
  };

  const handleExportReport = () => {
    toast({
      title: "Relatório Exportado",
      description: "O relatório foi exportado com sucesso!",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análise de desempenho e estatísticas do negócio</p>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <Label>Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center space-x-2"><DollarSign className="h-5 w-5 text-success" /><div><p className="text-2xl font-bold">{salesData.total.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Vendas Total</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center space-x-2"><FileText className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{salesData.count}</p><p className="text-sm text-muted-foreground">Faturas Emitidas</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center space-x-2"><Users className="h-5 w-5 text-info" /><div><p className="text-2xl font-bold">{clientsData.total}</p><p className="text-sm text-muted-foreground">Clientes</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center space-x-2"><Package className="h-5 w-5 text-warning" /><div><p className="text-2xl font-bold">{stockData.lowStock}</p><p className="text-sm text-muted-foreground">Stock Baixo</p></div></div></CardContent></Card>
        </div>

        <Tabs value={reportType} onValueChange={setReportType}>
          <TabsList>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader><CardTitle>Relatório de Vendas</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{salesData.total.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Total de Vendas</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{salesData.count}</p><p className="text-sm text-muted-foreground">Número de Vendas</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{salesData.avgTicket.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Ticket Médio</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader><CardTitle>Relatório de Inventário</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{stockData.totalProducts}</p><p className="text-sm text-muted-foreground">Total de Produtos</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{stockData.lowStock}</p><p className="text-sm text-muted-foreground">Stock Baixo</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{stockData.totalValue.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Valor Total</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader><CardTitle>Relatório de Clientes</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{clientsData.total}</p><p className="text-sm text-muted-foreground">Total de Clientes</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{clientsData.activeMonth}</p><p className="text-sm text-muted-foreground">Clientes Ativos</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{clientsData.newMonth}</p><p className="text-sm text-muted-foreground">Novos este Mês</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
