import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Download, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDocument, convertQuotationToInvoice, clients } = useData();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const document = getDocument(id || "");
  const quotation = document?.type === "quotation" ? document : null;
  
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
    window.print();
    toast({
      title: "Impressão iniciada",
      description: "A cotação está sendo preparada para impressão.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download iniciado", 
      description: "O PDF da cotação será baixado em breve.",
    });
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      convertQuotationToInvoice(quotation.id);
      setIsProcessingPayment(false);
      toast({
        title: "Pagamento processado com sucesso!",
        description: "A cotação foi convertida em fatura.",
      });
      navigate("/");
    }, 2000);
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
              <h1 className="text-3xl font-bold text-foreground">Cotação {quotation.id}</h1>
              <p className="text-muted-foreground">
                Data: {new Date(quotation.date).toLocaleDateString()}
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
            {quotation.status === "Pendente" && (
              <Button 
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="bg-success hover:bg-success/90"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessingPayment ? "Processando..." : "Efetuar Pagamento"}
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
                <p>{quotation.id}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{new Date(quotation.date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Validade:</span>
                <p>{new Date(quotation.validUntil).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge 
                  variant={
                    quotation.status === "Aceite" ? "default" : 
                    quotation.status === "Pendente" ? "secondary" : 
                    "destructive"
                  }
                >
                  {quotation.status}
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
                  {quotation.items.map((item, index) => (
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
                <span>{quotation.subtotal.toFixed(2)} MTN</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (17%):</span>
                <span>{quotation.taxAmount.toFixed(2)} MTN</span>
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
                  <li>• Esta cotação é válida até {new Date(quotation.validUntil).toLocaleDateString()}</li>
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