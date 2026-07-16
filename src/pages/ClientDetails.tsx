import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Receipt as ReceiptIcon,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { documentStatusLabel, documentStatusVariant, paymentMethodLabel } from "@/lib/statusLabels";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ClientDetails() {
  const { id } = useParams();
  const { clients, documents, payments } = useData();

  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground">Cliente não encontrado</h2>
          <Link to="/clients">
            <Button className="mt-4">Voltar aos Clientes</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const invoices = documents
    .filter((d) => d.type === "FACT" && d.clientId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const quotations = documents
    .filter((d) => d.type === "COT" && d.clientId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const clientReceipts = payments
    .filter((p) => p.documents.some((alloc) => alloc.document?.clientId === id))
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = invoices
    .filter((i) => i.status !== "paid" && i.status !== "canceled")
    .reduce((sum, i) => sum + Math.max(i.total - i.paidAmount, 0), 0);

  const invoicesPagination = usePagination(invoices);
  const quotationsPagination = usePagination(quotations);
  const receiptsPagination = usePagination(clientReceipts);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/clients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
            <p className="text-muted-foreground">
              Cliente desde {formatDate(client.createdAt)}
            </p>
          </div>
        </div>

        {/* Client info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{client.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{client.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{client.address || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>NUIT: {client.nuit || "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
                  <p className="text-sm text-muted-foreground">Total Faturado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <ReceiptIcon className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
                  <p className="text-sm text-muted-foreground">Total Recebido</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
                  <p className="text-sm text-muted-foreground">Saldo em Aberto</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-info" />
                <div>
                  <p className="text-2xl font-bold">{quotations.length}</p>
                  <p className="text-sm text-muted-foreground">Cotações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Faturas ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma fatura para este cliente</p>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesPagination.pageItems.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link to={`/invoice/${invoice.id}`} className="font-mono text-primary hover:underline">
                          {invoice.code}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={documentStatusVariant(invoice.displayStatus)}>
                          {documentStatusLabel("FACT", invoice.displayStatus)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={invoicesPagination.page}
                totalPages={invoicesPagination.totalPages}
                pageSize={invoicesPagination.pageSize}
                totalItems={invoicesPagination.totalItems}
                onPageChange={invoicesPagination.setPage}
                onPageSizeChange={invoicesPagination.setPageSize}
              />
              </>
            )}
          </CardContent>
        </Card>

        {/* Quotations */}
        <Card>
          <CardHeader>
            <CardTitle>Cotações ({quotations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {quotations.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma cotação para este cliente</p>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationsPagination.pageItems.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell>
                        <Link to={`/quotation/${quotation.id}`} className="font-mono text-primary hover:underline">
                          {quotation.code}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(quotation.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(quotation.total)}</TableCell>
                      <TableCell>
                        <Badge variant={documentStatusVariant(quotation.displayStatus)}>
                          {documentStatusLabel("COT", quotation.displayStatus)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={quotationsPagination.page}
                totalPages={quotationsPagination.totalPages}
                pageSize={quotationsPagination.pageSize}
                totalItems={quotationsPagination.totalItems}
                onPageChange={quotationsPagination.setPage}
                onPageSizeChange={quotationsPagination.setPageSize}
              />
              </>
            )}
          </CardContent>
        </Card>

        {/* Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>Recibos ({clientReceipts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {clientReceipts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum recibo para este cliente</p>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptsPagination.pageItems.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <Link to={`/receipt/${receipt.id}`} className="font-mono text-primary hover:underline">
                          {receipt.receiptCode}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(receipt.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge variant={receipt.method === "numerario" ? "default" : "secondary"}>
                          {paymentMethodLabel(receipt.method)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={receiptsPagination.page}
                totalPages={receiptsPagination.totalPages}
                pageSize={receiptsPagination.pageSize}
                totalItems={receiptsPagination.totalItems}
                onPageChange={receiptsPagination.setPage}
                onPageSizeChange={receiptsPagination.setPageSize}
              />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
