import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Download, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { documentStatusLabel, documentStatusVariant } from "@/lib/statusLabels";
import { ApiError } from "@/lib/api";
import { printAs } from "@/lib/printDocument";
import { AppDocument } from "@/types";

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchDocument, convertQuotationToInvoice, clients } = useData();
  const [quotation, setQuotation] = useState<AppDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchDocument(id)
      .then((doc) => setQuotation(doc.type === "COT" ? doc : null))
      .catch(() => setQuotation(null))
      .finally(() => setLoading(false));
  }, [id, fetchDocument]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!quotation) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground">Cotação não encontrada</h2>
          <Link to="/">
            <Button className="mt-4">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const client = clients.find(c => c.id === quotation.clientId);

  const handlePrint = () => {
    printAs(`Cotacao ${quotation.code} - ${quotation.clientName}`);
    toast({
      title: "Impressão iniciada",
      description: "A cotação está sendo preparada para impressão.",
    });
  };

  const handleDownload = () => {
    printAs(`Cotacao ${quotation.code} - ${quotation.clientName}`);
    toast({
      title: "Download iniciado",
      description: "Escolha \"Guardar como PDF\" na caixa de impressão.",
    });
  };

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      const invoice = await convertQuotationToInvoice(quotation.id);
      toast({
        title: "Cotação convertida!",
        description: `A cotação foi convertida na fatura ${invoice.code}.`,
      });
      navigate(`/invoice/${invoice.id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro ao converter cotação",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="print:hidden flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cotação {quotation.code}</h1>
              <p className="text-muted-foreground">
                Data: {new Date(quotation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            {(quotation.status === "issued" || quotation.status === "draft") && (
              <Button
                onClick={handleConvert}
                disabled={isProcessing}
                className="bg-success hover:bg-success/90"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessing ? "Convertendo..." : "Converter em Fatura"}
              </Button>
            )}
          </div>
        </div>

        {/* Quotation Content */}
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
              <div>
                <h3 className="text-lg font-semibold">Cotação para:</h3>
                <p className="text-sm">
                  {quotation.clientName}<br />
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
                <p>{quotation.code}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{new Date(quotation.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Validade:</span>
                <p>{quotation.dueDate ? new Date(quotation.dueDate).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge variant={documentStatusVariant(quotation.displayStatus)}>
                  {documentStatusLabel("COT", quotation.displayStatus)}
                </Badge>
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
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{item.unitPrice.toFixed(2)} MTN</td>
                      <td className="text-right py-2">{item.lineTotal.toFixed(2)} MTN</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{(quotation.subtotalProducts + quotation.subtotalServices).toFixed(2)} MTN</span>
              </div>
              {quotation.discountValue > 0 && (
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>-{quotation.discountValue.toFixed(2)} MTN</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Imposto:</span>
                <span>{quotation.vatValue.toFixed(2)} MTN</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{quotation.total.toFixed(2)} MTN</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium mb-2">Condições:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Esta cotação é válida até{" "}
                    {quotation.dueDate ? new Date(quotation.dueDate).toLocaleDateString() : "—"}
                  </li>
                  <li>• Preços sujeitos a alteração sem aviso prévio</li>
                  <li>• Pagamento à vista ou em até 30 dias</li>
                  <li>• Instalação incluída no preço</li>
                </ul>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Obrigado pela oportunidade de apresentar esta cotação!</p>
                <p>Para mais informações, entre em contato conosco.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
