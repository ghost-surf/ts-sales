import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { printAs } from "@/lib/printDocument";
import { Payment } from "@/types";

export default function ReceiptDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const { fetchPayment, clients } = useData();
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPayment(id)
      .then(setReceipt)
      .catch(() => setReceipt(null))
      .finally(() => setLoading(false));
  }, [id, fetchPayment]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!receipt) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground">Recibo não encontrado</h2>
          <Link to="/receipts">
            <Button className="mt-4">Voltar aos Recibos</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const clientNames = [...new Set(
    receipt.documents
      .map((alloc) => clients.find((c) => c.id === alloc.document?.clientId)?.name)
      .filter((name): name is string => Boolean(name))
  )];

  const receiptFilename = `Recibo ${receipt.receiptCode} - ${clientNames.join(", ") || "cliente"}`;

  const handlePrint = () => printAs(receiptFilename);

  const handleDownload = () => {
    printAs(receiptFilename);
    toast({ title: "Preparando impressão", description: "Use \"Guardar como PDF\" na caixa de impressão." });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="print:hidden flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/receipts">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Recibo {receipt.receiptCode}</h1>
              <p className="text-muted-foreground">
                Data: {new Date(receipt.paymentDate).toLocaleDateString()}
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
                <h3 className="text-lg font-semibold">Recibo passado a:</h3>
                <p className="text-sm">{clientNames.join(", ") || "—"}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Código:</span>
                <p>{receipt.receiptCode}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{new Date(receipt.paymentDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Forma de Pagamento:</span>
                <div>
                  <Badge variant={receipt.method === "numerario" ? "default" : "secondary"}>
                    {receipt.method === "numerario" ? "Numerário" : "Cheque"}
                  </Badge>
                  {receipt.chequeNumber && (
                    <span className="ml-2 text-muted-foreground">Nº {receipt.chequeNumber}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium">Operador:</span>
                <p>{receipt.operator?.name ?? "—"}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Documento</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-right py-2">Total do Documento</th>
                    <th className="text-right py-2">Valor Alocado</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.documents.map((alloc) => (
                    <tr key={alloc.documentId} className="border-b">
                      <td className="py-2">
                        <Link to={`/invoice/${alloc.documentId}`} className="text-primary hover:underline">
                          {alloc.document?.code ?? alloc.documentId}
                        </Link>
                      </td>
                      <td className="py-2">{alloc.document?.type === "FACT" ? "Fatura" : "Cotação"}</td>
                      <td className="text-right py-2">{alloc.document?.total?.toFixed(2) ?? "—"} MTN</td>
                      <td className="text-right py-2">{alloc.amount.toFixed(2)} MTN</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-2">
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Recebido:</span>
                <span>{receipt.amount.toFixed(2)} MTN</span>
              </div>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              <p>Obrigado pela sua preferência!</p>
              <p>Este recibo foi gerado eletronicamente pelo sistema HydroStock Pro.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
