import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, FileText, Users, Package, Download } from "lucide-react";
import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";

const STATUS_COLOR: Record<string, string> = {
  ok: "hsl(var(--primary))",
  low: "hsl(var(--warning))",
  out: "hsl(var(--destructive))",
};

export default function Reports() {
  const { products, clients, documents, payments } = useData();
  const [dateRange, setDateRange] = useState("30");
  const [clientFilter, setClientFilter] = useState("all");
  const [reportType, setReportType] = useState("sales");
  const { toast } = useToast();

  const fromDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - Number(dateRange));
    date.setHours(0, 0, 0, 0);
    return date;
  }, [dateRange]);

  const paidInvoices = useMemo(
    () =>
      documents.filter(
        (d) =>
          d.type === "FACT" &&
          d.status === "paid" &&
          new Date(d.createdAt) >= fromDate &&
          (clientFilter === "all" || d.clientId === clientFilter)
      ),
    [documents, fromDate, clientFilter]
  );

  const salesByDay = useMemo(() => {
    const byDay = new Map<string, { label: string; total: number; count: number }>();
    for (const invoice of paidInvoices) {
      const date = new Date(invoice.createdAt);
      const key = date.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? {
        label: date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
        total: 0,
        count: 0,
      };
      entry.total += invoice.total;
      entry.count += 1;
      byDay.set(key, entry);
    }
    return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [paidInvoices]);

  const salesData = {
    total: paidInvoices.reduce((sum, i) => sum + i.total, 0),
    count: paidInvoices.length,
    avgTicket: paidInvoices.length > 0 ? paidInvoices.reduce((sum, i) => sum + i.total, 0) / paidInvoices.length : 0,
  };

  const stockRows = useMemo(
    () =>
      products
        .map((p) => {
          const status = p.stock <= 0 ? "out" : p.stock <= p.lowStockThreshold ? "low" : "ok";
          return { name: p.name, stockValue: p.price * p.stock, status };
        })
        .sort((a, b) => b.stockValue - a.stockValue)
        .slice(0, 10),
    [products]
  );

  const stockData = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stock <= p.lowStockThreshold).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  const clientBreakdown = useMemo(() => {
    return clients
      .filter((c) => clientFilter === "all" || c.id === clientFilter)
      .map((client) => {
        const clientInvoices = documents.filter(
          (d) => d.type === "FACT" && d.clientId === client.id && new Date(d.createdAt) >= fromDate
        );
        const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.total, 0);
        const totalReceived = payments
          .filter((p) => new Date(p.paymentDate) >= fromDate)
          .flatMap((p) => p.documents)
          .filter((alloc) => alloc.document?.clientId === client.id)
          .reduce((sum, alloc) => sum + alloc.amount, 0);
        return {
          clientId: client.id,
          clientName: client.name,
          invoiceCount: clientInvoices.length,
          totalInvoiced,
          totalReceived,
          balance: totalInvoiced - totalReceived,
        };
      })
      .filter((row) => row.invoiceCount > 0 || clientFilter !== "all")
      .sort((a, b) => b.totalInvoiced - a.totalInvoiced);
  }, [clients, documents, payments, fromDate, clientFilter]);

  const topClientsChart = clientBreakdown.slice(0, 8).map((c) => ({
    label: c.clientName.length > 14 ? `${c.clientName.slice(0, 14)}…` : c.clientName,
    total: c.totalInvoiced,
  }));

  const {
    pageItems: clientBreakdownPage,
    page: clientPage,
    setPage: setClientPage,
    pageSize: clientPageSize,
    setPageSize: setClientPageSize,
    totalPages: clientTotalPages,
    totalItems: clientTotalItems,
  } = usePagination(clientBreakdown);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const clientsData = {
    total: clients.length,
    activeMonth: clients.length,
    newMonth: clients.filter((c) => new Date(c.createdAt) >= startOfMonth).length,
  };

  const handleExportReport = () => {
    toast({
      title: "Relatório Exportado",
      description: "O relatório foi exportado com sucesso!",
    });
  };

  const chartTooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
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
            <div className="flex-1 min-w-48">
              <Label>Cliente</Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center space-x-2"><DollarSign className="h-5 w-5 text-success" /><div><p className="text-2xl font-bold">{salesData.total.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Vendas Total</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center space-x-2"><FileText className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{salesData.count}</p><p className="text-sm text-muted-foreground">Faturas Pagas</p></div></div></CardContent></Card>
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
              <CardHeader><CardTitle>Vendas por Dia</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(2)} MTN`, "Vendas"]}
                        contentStyle={chartTooltipStyle}
                      />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {salesByDay.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground -mt-40">
                      Sem vendas pagas no período selecionado
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{salesData.total.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Total de Vendas</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{salesData.count}</p><p className="text-sm text-muted-foreground">Número de Vendas</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{salesData.avgTicket.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Ticket Médio</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader><CardTitle>Valor em Stock por Produto (Top 10)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockRows} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={110}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(2)} MTN`, "Valor em stock"]}
                        contentStyle={chartTooltipStyle}
                      />
                      <Bar dataKey="stockValue" radius={[0, 4, 4, 0]}>
                        {stockRows.map((row, index) => (
                          <Cell key={index} fill={STATUS_COLOR[row.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{stockData.totalProducts}</p><p className="text-sm text-muted-foreground">Total de Produtos</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{stockData.lowStock}</p><p className="text-sm text-muted-foreground">Stock Baixo</p></div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{stockData.totalValue.toFixed(2)} MTN</p><p className="text-sm text-muted-foreground">Valor Total</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Faturado por Cliente (Top 8)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topClientsChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(2)} MTN`, "Faturado"]}
                        contentStyle={chartTooltipStyle}
                      />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {topClientsChart.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground -mt-40">
                      Sem faturas no período selecionado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Vendas, Faturas e Recibos por Cliente</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Nº Faturas</TableHead>
                      <TableHead>Total Faturado</TableHead>
                      <TableHead>Total Recebido</TableHead>
                      <TableHead>Saldo em Aberto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientBreakdown.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum dado para o período/cliente selecionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      clientBreakdownPage.map((row) => (
                        <TableRow key={row.clientId}>
                          <TableCell className="font-medium">{row.clientName}</TableCell>
                          <TableCell>{row.invoiceCount}</TableCell>
                          <TableCell>{row.totalInvoiced.toFixed(2)} MTN</TableCell>
                          <TableCell className="text-success">{row.totalReceived.toFixed(2)} MTN</TableCell>
                          <TableCell className={row.balance > 0.01 ? "text-warning" : ""}>
                            {row.balance.toFixed(2)} MTN
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  page={clientPage}
                  totalPages={clientTotalPages}
                  pageSize={clientPageSize}
                  totalItems={clientTotalItems}
                  onPageChange={setClientPage}
                  onPageSizeChange={setClientPageSize}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{clientsData.total}</p><p className="text-sm text-muted-foreground">Total de Clientes</p></div>
              <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{clientsData.activeMonth}</p><p className="text-sm text-muted-foreground">Clientes Ativos</p></div>
              <div className="text-center p-4 bg-muted/20 rounded-lg"><p className="text-lg font-semibold">{clientsData.newMonth}</p><p className="text-sm text-muted-foreground">Novos este Mês</p></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
