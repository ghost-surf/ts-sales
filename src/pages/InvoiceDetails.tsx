import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

export default function InvoiceDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const { getDocument, clients } = useData();

  const document = getDocument(id || "");
  const invoice = document?.type === "invoice" ? document : null;

  if (!invoice) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground">Fatura não encontrada</h2>
          <Link to="/">
            <Button className="mt-4">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const client = clients.find(c => c.id === invoice.clientId);

  const handlePrint = () => {
    window.print();
    toast({
      title: "Impressão iniciada",
      description: "A fatura está sendo preparada para impressão.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download iniciado", 
      description: "O PDF da fatura será baixado em breve.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fatura {invoice.id}</h1>
              <p className="text-muted-foreground">
                Data: {new Date(invoice.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">HydroStock Pro</h2>
                <p className="text-sm text-muted-foreground">
                  Rua Principal, 456<br />
                  Maputo, Moçambique<br />
                  Tel: +258 21 123 456<br />
                  NUIT: 987654321
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold">Faturar a:</h3>
                <p className="text-sm">
                  {invoice.clientName}<br />
                  {client?.address}<br />
                  Tel: {client?.phone}<br />
                  Email: {client?.email}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Número:</span>
                <p>{invoice.id}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{new Date(invoice.date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Vencimento:</span>
                <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === "Paga"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Produto/Serviço</th>
                    <th className="text-right py-2">Qtd</th>
                    <th className="text-right py-2">Preço Unit.</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{item.unitPrice.toFixed(2)} MTN</td>
                      <td className="text-right py-2">{item.total.toFixed(2)} MTN</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{invoice.subtotal.toFixed(2)} MTN</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (17%):</span>
                <span>{invoice.taxAmount.toFixed(2)} MTN</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{invoice.total.toFixed(2)} MTN</span>
              </div>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              <p>Obrigado pela sua preferência!</p>
              <p>Esta fatura foi gerada eletronicamente pelo sistema HydroStock Pro.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}