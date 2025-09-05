import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Search, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

export default function Receipts() {
  const { getInvoices } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock receipts data based on paid invoices
  const invoices = getInvoices();
  const paidInvoices = invoices.filter(invoice => invoice.status === "Paga");
  
  const mockReceipts = paidInvoices.map((invoice, index) => ({
    id: `REC-${String(index + 1).padStart(4, "0")}/25`,
    invoiceId: invoice.id,
    clientName: invoice.clientName,
    amount: invoice.total,
    paymentMethod: index % 2 === 0 ? "numerario" : "cheque",
    chequeNumber: index % 2 === 1 ? `CHQ-${1000 + index}` : null,
    date: invoice.date,
    operatorName: "Sistema HydroStock"
  }));

  const filteredReceipts = mockReceipts.filter(receipt =>
    receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentMethodBadge = (method: string) => {
    return method === 'numerario' ? (
      <Badge variant="default">Numerário</Badge>
    ) : (
      <Badge variant="secondary">Cheque</Badge>
    );
  };

  const handleViewReceipt = (receipt: any) => {
    toast({
      title: "Visualizar Recibo",
      description: `Abrindo recibo ${receipt.id}...`,
    });
  };

  const handleDownloadReceipt = (receipt: any) => {
    toast({
      title: "Download Iniciado",
      description: `O PDF do recibo ${receipt.id} será baixado em breve.`,
    });
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{mockReceipts.length}</p>
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
                    {mockReceipts.reduce((sum, r) => sum + r.amount, 0).toFixed(2)} MTN
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
                    {mockReceipts.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
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
                  Os recibos são gerados automaticamente quando as faturas são pagas.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fatura</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium font-mono">
                        {receipt.id}
                      </TableCell>
                      <TableCell>{receipt.clientName}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {receipt.invoiceId}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getPaymentMethodBadge(receipt.paymentMethod)}
                          {receipt.chequeNumber && (
                            <div className="text-xs text-muted-foreground">
                              Nº {receipt.chequeNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {receipt.amount.toFixed(2)} MTN
                      </TableCell>
                      <TableCell>
                        {new Date(receipt.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{receipt.operatorName}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}