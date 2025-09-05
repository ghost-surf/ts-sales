import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Search, Eye, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentWithDetails {
  id: string;
  receipt_code: string;
  payment_date: string;
  method: 'numerario' | 'cheque';
  cheque_number: string | null;
  amount: number;
  created_at: string;
  profiles: {
    name: string;
  };
  payment_documents: {
    amount: number;
    documents: {
      code: string;
      type: string;
      clients: {
        name: string;
      };
    };
  }[];
}

export default function Receipts() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles (
            name
          ),
          payment_documents (
            amount,
            documents (
              code,
              type,
              clients (
                name
              )
            )
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Erro ao carregar recibos');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.receipt_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_documents.some(pd => 
      pd.documents.clients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pd.documents.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getPaymentMethodBadge = (method: string) => {
    return method === 'numerario' ? (
      <Badge variant="default">Numerário</Badge>
    ) : (
      <Badge variant="secondary">Cheque</Badge>
    );
  };

  const handleViewReceipt = (payment: PaymentWithDetails) => {
    // This would open a modal or redirect to a detailed view
    console.log('View receipt:', payment);
    toast.info('Funcionalidade de visualização em desenvolvimento');
  };

  const handleDownloadReceipt = (payment: PaymentWithDetails) => {
    // This would generate and download a PDF
    console.log('Download receipt:', payment);
    toast.info('Funcionalidade de download em desenvolvimento');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

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
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum recibo encontrado para a pesquisa' : 'Nenhum recibo encontrado'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Faturas</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const clientName = payment.payment_documents[0]?.documents.clients.name || 'N/A';
                    const invoiceCodes = payment.payment_documents.map(pd => pd.documents.code).join(', ');
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono">
                          {payment.receipt_code}
                        </TableCell>
                        <TableCell>{clientName}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {invoiceCodes}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getPaymentMethodBadge(payment.method)}
                            {payment.cheque_number && (
                              <div className="text-xs text-muted-foreground">
                                Nº {payment.cheque_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {payment.amount.toFixed(2)} MTN
                        </TableCell>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell>{payment.profiles.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReceipt(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}