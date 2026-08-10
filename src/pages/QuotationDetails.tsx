import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Printer, Download, CreditCard, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { documentStatusLabel, documentStatusVariant } from "@/lib/statusLabels";
import { ApiError } from "@/lib/api";
import { printAs } from "@/lib/printDocument";
import { DocumentHeader } from "@/components/DocumentHeader";
import { DocumentBankDetails } from "@/components/DocumentBankDetails";
import { formatCurrency, formatDate } from "@/lib/format";
import { AppDocument } from "@/types";

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchDocument, convertQuotationToInvoice, clients, updateDocumentDates } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [quotation, setQuotation] = useState<AppDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [editDatesOpen, setEditDatesOpen] = useState(false);
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [savingDates, setSavingDates] = useState(false);

  const loadQuotation = () => {
    if (!id) return;
    setLoading(true);
    fetchDocument(id)
      .then((doc) => setQuotation(doc.type === "COT" ? doc : null))
      .catch(() => setQuotation(null))
      .finally(() => setLoading(false));
  };

  useEffect(loadQuotation, [id, fetchDocument]);

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

  const openEditDatesDialog = () => {
    setEditCreatedAt(quotation.createdAt.slice(0, 10));
    setEditDueDate(quotation.dueDate ? quotation.dueDate.slice(0, 10) : "");
    setEditDatesOpen(true);
  };

  const handleSaveDates = async () => {
    setSavingDates(true);
    try {
      await updateDocumentDates(quotation.id, {
        createdAt: editCreatedAt ? new Date(editCreatedAt).toISOString() : undefined,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      setEditDatesOpen(false);
      loadQuotation();
      toast({ title: "Datas atualizadas!", description: "As datas da cotação foram atualizadas com sucesso." });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro ao atualizar datas",
        variant: "destructive",
      });
    } finally {
      setSavingDates(false);
    }
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
                Data: {formatDate(quotation.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isAdmin && (
              <Dialog open={editDatesOpen} onOpenChange={setEditDatesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={openEditDatesDialog}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Datas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Datas da Cotação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="editCreatedAt">Data de Emissão</Label>
                      <Input
                        id="editCreatedAt"
                        type="date"
                        value={editCreatedAt}
                        onChange={(e) => setEditCreatedAt(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editDueDate">Data de Validade</Label>
                      <Input
                        id="editDueDate"
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveDates} disabled={savingDates}>
                        {savingDates ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Guardar
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditDatesOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
          <CardHeader className="pb-3">
            <DocumentHeader
              clientLabel="Cotação para"
              client={{
                name: quotation.clientName,
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
                <p>{quotation.code}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{formatDate(quotation.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium">Validade:</span>
                <p>{formatDate(quotation.dueDate)}</p>
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-left py-2">Produto/Serviço</th>
                    <th className="text-right py-2">Qtd</th>
                    <th className="text-right py-2">Preço Unit.</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 1 ? "bg-muted/40" : "bg-white"}>
                      <td className="py-2 px-2">{index + 1}</td>
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
                <span>{formatCurrency(quotation.subtotalProducts + quotation.subtotalServices)}</span>
              </div>
              {quotation.discountValue > 0 && (
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>{formatCurrency(-quotation.discountValue)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Imposto:</span>
                <span>{formatCurrency(quotation.vatValue)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(quotation.total)}</span>
              </div>
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
