import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Search, Eye, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { ApiError } from "@/lib/api";
import { normalizeSearch } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/statusLabels";
import { Payment, PaymentMethod } from "@/types";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";

export default function Receipts() {
  const { payments, documents, registerPayment } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<PaymentMethod>("numerario");
  const [chequeNumber, setChequeNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const clientNamesFor = (payment: Payment) => {
    const names = payment.documents
      .map((alloc) => documents.find((d) => d.id === alloc.documentId)?.clientName)
      .filter((name): name is string => Boolean(name));
    return [...new Set(names)].join(", ") || "—";
  };

  const documentCodesFor = (payment: Payment) =>
    payment.documents.map((alloc) => alloc.document?.code ?? alloc.documentId).join(", ");

  const filteredReceipts = payments.filter((receipt) =>
    receipt.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clientNamesFor(receipt).toLowerCase().includes(searchTerm.toLowerCase()) ||
    documentCodesFor(receipt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems } = usePagination(filteredReceipts);

  const today = new Date().toISOString().split('T')[0];

  const getPaymentMethodBadge = (method: PaymentMethod) => (
    <Badge variant={method === "numerario" ? "default" : "secondary"}>{paymentMethodLabel(method)}</Badge>
  );

  const handleViewReceipt = (receipt: Payment) => navigate(`/receipt/${receipt.id}`);
  const handleDownloadReceipt = (receipt: Payment) => navigate(`/receipt/${receipt.id}`);

  // ---- New receipt dialog: pick several unpaid/partially-paid invoices ----
  const payableInvoices = useMemo(
    () =>
      documents
        .filter((d) => d.type === "FACT" && d.status !== "paid" && d.status !== "canceled")
        .map((d) => ({ ...d, remaining: Math.max(d.total - d.paidAmount, 0) }))
        .filter((d) => d.remaining > 0.01)
        .filter(
          (d) =>
            normalizeSearch(d.code).includes(normalizeSearch(invoiceSearch)) ||
            normalizeSearch(d.clientName).includes(normalizeSearch(invoiceSearch))
        ),
    [documents, invoiceSearch]
  );

  const totalAmount = selectedIds.reduce((sum, id) => sum + (parseFloat(amounts[id]) || 0), 0);

  const openNewReceiptDialog = () => {
    setSelectedIds([]);
    setAmounts({});
    setMethod("numerario");
    setChequeNumber("");
    setInvoiceSearch("");
    setDialogOpen(true);
  };

  const toggleInvoice = (invoiceId: string, remaining: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(invoiceId)) {
        return prev.filter((id) => id !== invoiceId);
      }
      setAmounts((prevAmounts) => ({ ...prevAmounts, [invoiceId]: remaining.toFixed(2) }));
      return [...prev, invoiceId];
    });
  };

  const handleCreateReceipt = async () => {
    if (selectedIds.length === 0) {
      toast({ title: "Erro", description: "Selecione pelo menos uma fatura", variant: "destructive" });
      return;
    }
    if (method === "cheque" && !chequeNumber.trim()) {
      toast({ title: "Erro", description: "Indique o número do cheque", variant: "destructive" });
      return;
    }
    const allocations = selectedIds.map((id) => ({ documentId: id, amount: parseFloat(amounts[id]) || 0 }));
    if (allocations.some((a) => a.amount <= 0)) {
      toast({ title: "Erro", description: "Todos os valores alocados devem ser maiores que zero", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const payment = await registerPayment({
        method,
        chequeNumber: method === "cheque" ? chequeNumber : undefined,
        allocations,
      });
      setDialogOpen(false);
      toast({
        title: "Recibo criado!",
        description: `Recibo ${payment.receiptCode} criado com sucesso, cobrindo ${allocations.length} fatura(s).`,
      });
      navigate(`/receipt/${payment.id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro ao criar recibo",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recibos</h1>
            <p className="text-muted-foreground">
              Histórico de pagamentos e recibos emitidos
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => (open ? openNewReceiptDialog() : setDialogOpen(false))}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Recibo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Recibo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar fatura por código ou cliente..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-64 rounded-md border">
                  <div className="p-2 space-y-1">
                    {payableInvoices.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma fatura em aberto encontrada
                      </p>
                    )}
                    {payableInvoices.map((invoice) => {
                      const checked = selectedIds.includes(invoice.id);
                      return (
                        <div key={invoice.id} className="flex items-center gap-3 p-2 border rounded-md">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleInvoice(invoice.id, invoice.remaining)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {invoice.code} · {invoice.clientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total: {invoice.total.toFixed(2)} MTN · Saldo: {invoice.remaining.toFixed(2)} MTN
                            </p>
                          </div>
                          {checked && (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={invoice.remaining}
                              value={amounts[invoice.id] ?? ""}
                              disabled
                              readOnly
                              onChange={(e) => setAmounts((prev) => ({ ...prev, [invoice.id]: e.target.value }))}
                              className="w-28 h-8 text-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-receipt-method">Forma de Pagamento</Label>
                    <Select value={method} onValueChange={(v: PaymentMethod) => setMethod(v)}>
                      <SelectTrigger id="new-receipt-method">
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
                      <Label htmlFor="new-receipt-cheque">Número do Cheque</Label>
                      <Input
                        id="new-receipt-cheque"
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                        placeholder="Ex: CHQ-1001"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedIds.length} fatura(s) selecionada(s)
                    </p>
                    <p className="text-lg font-semibold">{totalAmount.toFixed(2)} MTN</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateReceipt} disabled={submitting || selectedIds.length === 0}>
                      {submitting ? "A criar..." : "Criar Recibo"}
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{payments.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Recibos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">
                    {payments.reduce((sum, r) => sum + r.amount, 0).toFixed(2)} MTN
                  </p>
                  <p className="text-sm text-muted-foreground">Valor Total Recebido</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-info" />
                <div>
                  <p className="text-2xl font-bold">
                    {payments.filter(r => r.paymentDate.startsWith(today)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Recibos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Lista de Recibos</span>
            </CardTitle>
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar por código, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReceipts.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum recibo encontrado para a pesquisa' : 'Nenhum recibo encontrado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Novo Recibo" para registar um pagamento sobre uma ou mais faturas.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fatura(s)</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium font-mono">
                        <div className="flex items-center gap-2">
                          {receipt.receiptCode}
                          {receipt.kind === "reversal" && <Badge variant="destructive">Estorno</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{clientNamesFor(receipt)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {documentCodesFor(receipt)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getPaymentMethodBadge(receipt.method)}
                          {receipt.chequeNumber && (
                            <div className="text-xs text-muted-foreground">
                              Nº {receipt.chequeNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`font-mono font-medium ${receipt.kind === "reversal" ? "text-destructive" : ""}`}
                      >
                        {receipt.amount.toFixed(2)} MTN
                      </TableCell>
                      <TableCell>
                        {new Date(receipt.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{receipt.operator?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceipt(receipt)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(receipt)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <TablePagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
