import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Printer, Download, Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { documentStatusLabel } from "@/lib/statusLabels";
import { ApiError } from "@/lib/api";
import { printAs } from "@/lib/printDocument";
import { AppDocument } from "@/types";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchDocument, clients, registerPayment } = useData();
  const [invoice, setInvoice] = useState<AppDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [method, setMethod] = useState<"numerario" | "cheque">("numerario");
  const [chequeNumber, setChequeNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadInvoice = () => {
    if (!id) return;
    setLoading(true);
    fetchDocument(id)
      .then((doc) => setInvoice(doc.type === "FACT" ? doc : null))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  };

  useEffect(loadInvoice, [id, fetchDocument]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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
  const remaining = Math.max(invoice.total - invoice.paidAmount, 0);
  const canRegisterPayment = invoice.status !== "paid" && invoice.status !== "canceled" && remaining > 0.01;

  const handlePrint = () => {
    printAs(`Fatura ${invoice.code} - ${invoice.clientName}`);
    toast({
      title: "Impressão iniciada",
      description: "A fatura está sendo preparada para impressão.",
    });
  };

  const handleDownload = () => {
    printAs(`Fatura ${invoice.code} - ${invoice.clientName}`);
    toast({
      title: "Download iniciado",
      description: "Escolha \"Guardar como PDF\" na caixa de impressão.",
    });
  };

  const openPaymentDialog = () => {
    setMethod("numerario");
    setChequeNumber("");
    setAmount(remaining.toFixed(2));
    setPaymentDialogOpen(true);
  };

  const handleRegisterPayment = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast({ title: "Erro", description: "Indique um valor válido", variant: "destructive" });
      return;
    }
    if (method === "cheque" && !chequeNumber.trim()) {
      toast({ title: "Erro", description: "Indique o número do cheque", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const payment = await registerPayment({
        method,
        chequeNumber: method === "cheque" ? chequeNumber : undefined,
        allocations: [{ documentId: invoice.id, amount: value }],
      });
      setPaymentDialogOpen(false);
      toast({
        title: "Pagamento registado!",
        description: `Recibo ${payment.receiptCode} criado com sucesso.`,
      });
      navigate(`/receipt/${payment.id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro ao registar pagamento",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="print:hidden flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/invoices">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fatura {invoice.code}</h1>
              <p className="text-muted-foreground">
                Data: {new Date(invoice.createdAt).toLocaleDateString()}
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
            {canRegisterPayment && (
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-success hover:bg-success/90" onClick={openPaymentDialog}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Registar Pagamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registar Pagamento — {invoice.code}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Saldo em aberto: <span className="font-medium text-foreground">{remaining.toFixed(2)} MTN</span>
                    </p>
                    <div>
                      <Label htmlFor="method">Forma de Pagamento</Label>
                      <Select value={method} onValueChange={(v: "numerario" | "cheque") => setMethod(v)}>
                        <SelectTrigger id="method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numerario">Numerário</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {method === "cheque" && (
                      <div>
                        <Label htmlFor="chequeNumber">Número do Cheque</Label>
                        <Input
                          id="chequeNumber"
                          value={chequeNumber}
                          onChange={(e) => setChequeNumber(e.target.value)}
                          placeholder="Ex: CHQ-1001"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="amount">Valor (MTN)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={remaining}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleRegisterPayment} disabled={submitting}>
                        {submitting ? "A registar..." : "Confirmar Pagamento"}
                      </Button>
                      <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
                <p>{invoice.code}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Vencimento:</span>
                <p>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    invoice.displayStatus === "paid"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {documentStatusLabel("FACT", invoice.displayStatus)}
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
                  {invoice.items.map((item) => (
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
                <span>{(invoice.subtotalProducts + invoice.subtotalServices).toFixed(2)} MTN</span>
              </div>
              {invoice.discountValue > 0 && (
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>-{invoice.discountValue.toFixed(2)} MTN</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Imposto:</span>
                <span>{invoice.vatValue.toFixed(2)} MTN</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{invoice.total.toFixed(2)} MTN</span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-success">
                    <span>Pago:</span>
                    <span>{invoice.paidAmount.toFixed(2)} MTN</span>
                  </div>
                  {remaining > 0.01 && (
                    <div className="flex justify-between text-sm text-warning">
                      <span>Saldo em aberto:</span>
                      <span>{remaining.toFixed(2)} MTN</span>
                    </div>
                  )}
                </>
              )}
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
