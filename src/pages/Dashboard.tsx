import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { StockAlerts } from "@/components/Dashboard/StockAlerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { documentStatusLabel } from "@/lib/statusLabels";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  TrendingUp,
  Package,
  Users,
  Receipt,
  AlertTriangle,
  Euro,
  FileText,
} from "lucide-react";

interface SalesReport {
  series: Array<{ date: string; totalSales: number; ordersCount: number }>;
}

function buildLast7Days(series: SalesReport["series"]) {
  const byDate = new Map(series.map((entry) => [entry.date, entry]));
  const days: Array<{ label: string; total: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({
      label: date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
      total: byDate.get(key)?.totalSales ?? 0,
    });
  }
  return days;
}

interface RecentDocument {
  id: string;
  code: string;
  total: number;
  createdAt: string;
  displayStatus: string;
  client?: { name: string };
}

interface DashboardSummary {
  todaySales: number;
  todayInvoicesCount: number;
  totalStockUnits: number;
  totalProducts: number;
  lowStockCount: number;
  clientsCount: number;
  recentInvoices: RecentDocument[];
  recentQuotations: RecentDocument[];
}

const EMPTY_SUMMARY: DashboardSummary = {
  todaySales: 0,
  todayInvoicesCount: 0,
  totalStockUnits: 0,
  totalProducts: 0,
  lowStockCount: 0,
  clientsCount: 0,
  recentInvoices: [],
  recentQuotations: [],
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [chartData, setChartData] = useState<Array<{ label: string; total: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    api.get<DashboardSummary>("/reports/dashboard").then((data) => {
      if (!cancelled) setSummary(data);
    });

    const from = new Date();
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    api.get<SalesReport>(`/reports/sales?from=${from.toISOString()}`).then((data) => {
      if (!cancelled) setChartData(buildLast7Days(data.series));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão TS Sales
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Vendas Hoje"
            value={formatCurrency(summary.todaySales)}
            subtitle={`${summary.todayInvoicesCount} faturas pagas`}
            icon={Euro}
            variant="success"
          />
          <MetricCard
            title="Produtos em Stock"
            value={summary.totalStockUnits.toString()}
            subtitle={`${summary.totalProducts} produtos diferentes`}
            icon={Package}
          />
          <MetricCard
            title="Clientes Ativos"
            value={summary.clientsCount.toString()}
            subtitle="Clientes cadastrados"
            icon={Users}
            variant="success"
          />
          <MetricCard
            title="Stock Baixo"
            value={summary.lowStockCount.toString()}
            subtitle="Requer atenção urgente"
            icon={AlertTriangle}
            variant="warning"
          />
        </div>

        {/* Charts and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Vendas dos Últimos 7 Dias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      className="[&_text]:fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="[&_text]:fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Vendas"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <StockAlerts />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span>Faturas Recentes</span>
              </CardTitle>
              <Link to="/invoices" className="text-sm text-primary hover:underline">Ver todas</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div>
                      <Link
                        to={`/invoice/${invoice.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {invoice.code}
                      </Link>
                      <p className="text-sm text-muted-foreground">{invoice.client?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatCurrency(invoice.total)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.displayStatus === "paid"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {documentStatusLabel("FACT", invoice.displayStatus as any)}
                      </span>
                    </div>
                  </div>
                ))}
                {summary.recentInvoices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma fatura ainda</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Quotations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Cotações Recentes</span>
              </CardTitle>
              <Link to="/quotations" className="text-sm text-primary hover:underline">Ver todas</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.recentQuotations.map((quotation) => (
                  <div
                    key={quotation.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div>
                      <Link
                        to={`/quotation/${quotation.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {quotation.code}
                      </Link>
                      <p className="text-sm text-muted-foreground">{quotation.client?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(quotation.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatCurrency(quotation.total)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          quotation.displayStatus === "accepted"
                            ? "bg-success/10 text-success"
                            : quotation.displayStatus === "issued"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {documentStatusLabel("COT", quotation.displayStatus as any)}
                      </span>
                    </div>
                  </div>
                ))}
                {summary.recentQuotations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma cotação ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
