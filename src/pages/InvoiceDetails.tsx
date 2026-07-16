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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer, Download, Loader2, CreditCard, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { documentStatusLabel } from "@/lib/statusLabels";
import { ApiError } from "@/lib/api";
import { printAs } from "@/lib/printDocument";
import { DocumentHeader } from "@/components/DocumentHeader";
import { DocumentBankDetails } from "@/components/DocumentBankDetails";
import { formatCurrency, formatDate } from "@/lib/format";
import { AppDocument, PaymentMethod } from "@/types";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchDocument, clients, registerPayment, createCreditNote } = useData();
  const [invoice, setInvoice] = useState<AppDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("numerario");
  const [chequeNumber, setChequeNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [creditNoteDialogOpen, setCreditNoteDialogOpen] = useState(false);
  const [creditNoteReason, setCreditNoteReason] = useState("");
  const [issuingCreditNote, setIssuingCreditNote] = useState(false);

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
  const canIssueCreditNote =
    (invoice.status === "issued" || invoice.status === "paid") && !invoice.creditNote;

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

  const handleIssueCreditNote = async () => {
    setIssuingCreditNote(true);
    try {
      const creditNote = await createCreditNote(invoice.id, creditNoteReason.trim() || undefined);
      setCreditNoteDialogOpen(false);
      toast({
        title: "Nota de Crédito emitida!",
        description: `${creditNote.code} anulou a fatura ${invoice.code}. Stock e caixa foram repostos.`,
      });
      navigate(`/credit-note/${creditNote.id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro ao emitir Nota de Crédito",
        variant: "destructive",
      });
    } finally {
      setIssuingCreditNote(false);
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
                Data: {formatDate(invoice.createdAt)}
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
            {invoice.creditNote ? (
              <Link to={`/credit-note/${invoice.creditNote.id}`}>
                <Button variant="outline" className="text-destructive border-destructive/40">
                  <Ban className="h-4 w-4 mr-2" />
                  Ver Nota de Crédito {invoice.creditNote.code}
                </Button>
              </Link>
            ) : (
              canIssueCreditNote && (
                <Dialog
                  open={creditNoteDialogOpen}
                  onOpenChange={(open) => {
                    setCreditNoteDialogOpen(open);
                    if (open) setCreditNoteReason("");
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Ban className="h-4 w-4 mr-2" />
                      Emitir Nota de Crédito
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Emitir Nota de Crédito — {invoice.code}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Esta ação anula integralmente a fatura {invoice.code}. O stock vendido será reposto e,
                        {invoice.paidAmount > 0
                          ? " o valor já recebido será estornado do caixa."
                          : " caso ainda não haja pagamentos, nenhum estorno de caixa será necessário."}
                        {" "}Não é possível anular apenas parte da fatura.
                      </p>
                      <div>
                        <Label htmlFor="creditNoteReason">Motivo (opcional)</Label>
                        <Textarea
                          id="creditNoteReason"
                          value={creditNoteReason}
                          onChange={(e) => setCreditNoteReason(e.target.value)}
                          placeholder="Ex: Produto devolvido pelo cliente"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          onClick={handleIssueCreditNote}
                          disabled={issuingCreditNote}
                        >
                          {issuingCreditNote ? "A emitir..." : "Confirmar Anulação"}
                        </Button>
                        <Button variant="outline" onClick={() => setCreditNoteDialogOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )
            )}
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
                      Saldo em aberto: <span className="font-medium text-foreground">{formatCurrency(remaining)}</span>
                    </p>
                    <div>
                      <Label htmlFor="method">Forma de Pagamento</Label>
                      <Select value={method} onValueChange={(v: PaymentMethod) => setMethod(v)}>
                        <SelectTrigger id="method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numerario">Numerário</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
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
                      <Label htmlFor="amount">Valor (MT)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={remaining}
                        value={amount}
                        disabled
                        readOnly
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
          <CardHeader className="pb-3">
            <DocumentHeader
              clientLabel="Faturar a"
              client={{
                name: invoice.clientName,
                address: client?.address,
                nuit: client?.nuit,
                phone: client?.phone,
                email: client?.email,
              }}
            />
            <Separator className="my-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium">Número:</span>
                <p>{invoice.code}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium">Vencimento:</span>
                <p>{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    invoice.displayStatus === "paid"
                      ? "bg-success/10 text-success"
                      : invoice.displayStatus === "canceled"
                      ? "bg-destructive/10 text-destructive"
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
              <table className="w-full text-sm">
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
                    <tr key={item.id} className={index % 2 === 1 ? "bg-muted/40" : "bg-white"}>
                      <td className="py-2 px-2">{item.description}</td>
                      <td className="text-right py-2 px-2">{item.quantity}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotalProducts + invoice.subtotalServices)}</span>
              </div>
              {invoice.discountValue > 0 && (
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>{formatCurrency(-invoice.discountValue)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Imposto:</span>
                <span>{formatCurrency(invoice.vatValue)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-success">
                    <span>Pago:</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  {remaining > 0.01 && (
                    <div className="flex justify-between text-warning">
                      <span>Saldo em aberto:</span>
                      <span>{formatCurrency(remaining)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-8">
              <DocumentBankDetails />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
