import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { printAs } from "@/lib/printDocument";
import { DocumentHeader } from "@/components/DocumentHeader";
import { formatCurrency, formatDate } from "@/lib/format";
import { CreditNote } from "@/types";

export default function CreditNoteDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const { fetchCreditNote } = useData();
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCreditNote(id)
      .then(setCreditNote)
      .catch(() => setCreditNote(null))
      .finally(() => setLoading(false));
  }, [id, fetchCreditNote]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!creditNote) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground">Nota de Crédito não encontrada</h2>
          <Link to="/credit-notes">
            <Button className="mt-4">Voltar às Notas de Crédito</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const filename = `Nota de Credito ${creditNote.code} - ${creditNote.document.client.name}`;
  const handlePrint = () => printAs(filename);
  const handleDownload = () => {
    printAs(filename);
    toast({ title: "Preparando impressão", description: "Use \"Guardar como PDF\" na caixa de impressão." });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="print:hidden flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/credit-notes">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nota de Crédito {creditNote.code}</h1>
              <p className="text-muted-foreground">
                Data: {formatDate(creditNote.createdAt)}
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
          <CardHeader className="pb-3">
            <DocumentHeader
              clientLabel="Emitida a"
              client={{
                name: creditNote.document.client.name,
                address: creditNote.document.client.address,
                nuit: creditNote.document.client.nuit,
                phone: creditNote.document.client.phone,
                email: creditNote.document.client.email,
              }}
            />
            <Separator className="my-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium">Número:</span>
                <p>{creditNote.code}</p>
              </div>
              <div>
                <span className="font-medium">Data:</span>
                <p>{formatDate(creditNote.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium">Fatura Anulada:</span>
                <p>
                  <Link to={`/invoice/${creditNote.document.id}`} className="text-primary hover:underline">
                    {creditNote.document.code}
                  </Link>
                </p>
              </div>
              <div>
                <span className="font-medium">Operador:</span>
                <p>{creditNote.operator?.name ?? "—"}</p>
              </div>
            </div>
            {creditNote.reason && (
              <div className="mt-4 text-sm">
                <span className="font-medium">Motivo:</span>
                <p className="text-muted-foreground">{creditNote.reason}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
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
                  {creditNote.document.items.map((item, index) => (
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

            <div className="mt-6 space-y-2 text-sm">
              <Separator />
              <div className="flex justify-between text-lg font-semibold text-destructive">
                <span>Total Anulado:</span>
                <span>{formatCurrency(creditNote.total)}</span>
              </div>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              <p>
                Este documento anula integralmente a fatura {creditNote.document.code}. O stock vendido foi reposto
                e, caso tenha havido pagamentos, o valor recebido foi estornado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
