import { Layout } from "@/components/Layout/Layout";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { StockAlerts } from "@/components/Dashboard/StockAlerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import {
  TrendingUp,
  Package,
  Users,
  Receipt,
  ShoppingCart,
  AlertTriangle,
  Euro,
  FileText,
} from "lucide-react";

export default function Dashboard() {
  const { products, clients, getInvoices, getQuotations } = useData();
  
  const invoices = getInvoices();
  const quotations = getQuotations();
  
  // Calculate metrics
  const todaySales = invoices
    .filter(inv => inv.date === new Date().toISOString().split('T')[0])
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const totalProducts = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockProducts = products.filter(product => product.stock < 10);
  
  const recentInvoices = invoices.slice(-3);
  const recentQuotations = quotations.slice(-3);
  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão HydroStock Pro
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Vendas Hoje"
            value={`${todaySales.toFixed(2)} MTN`}
            subtitle={`${recentInvoices.length} faturas emitidas`}
            icon={Euro}
            trend={{ value: 12.5, label: "vs ontem" }}
            variant="success"
          />
          <MetricCard
            title="Produtos em Stock"
            value={totalProducts.toString()}
            subtitle={`${products.length} produtos diferentes`}
            icon={Package}
            trend={{ value: -2.3, label: "vs mês anterior" }}
          />
          <MetricCard
            title="Clientes Ativos"
            value={clients.length.toString()}
            subtitle="Clientes cadastrados"
            icon={Users}
            trend={{ value: 8.1, label: "vs mês anterior" }}
            variant="success"
          />
          <MetricCard
            title="Stock Baixo"
            value={lowStockProducts.length.toString()}
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
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Gráfico de vendas será implementado
                  </p>
                </div>
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
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span>Faturas Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div>
                      <Link 
                        to={`/invoice/${invoice.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {invoice.id}
                      </Link>
                      <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{invoice.total.toFixed(2)} MTN</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === "Paga"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Quotations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Cotações Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentQuotations.map((quotation) => (
                  <div
                    key={quotation.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div>
                      <Link 
                        to={`/quotation/${quotation.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {quotation.id}
                      </Link>
                      <p className="text-sm text-muted-foreground">{quotation.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quotation.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{quotation.total.toFixed(2)} MTN</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          quotation.status === "Aceite"
                            ? "bg-success/10 text-success"
                            : quotation.status === "Pendente"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {quotation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

const BarChart3 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);