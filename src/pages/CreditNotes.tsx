import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ban, Search } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { normalizeSearch } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";
import { formatCurrency, formatDate } from "@/lib/format";

export default function CreditNotes() {
  const { creditNotes } = useData();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = creditNotes.filter(
    (nc) =>
      normalizeSearch(nc.code).includes(normalizeSearch(searchTerm)) ||
      normalizeSearch(nc.document.code).includes(normalizeSearch(searchTerm)) ||
      normalizeSearch(nc.document.client.name).includes(normalizeSearch(searchTerm))
  );

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems } = usePagination(filtered);

  const totalAnulado = creditNotes.reduce((sum, nc) => sum + nc.total, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notas de Crédito</h1>
          <p className="text-muted-foreground">Anulações totais de faturas já emitidas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Ban className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{creditNotes.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Notas de Crédito</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Ban className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalAnulado)}</p>
                  <p className="text-sm text-muted-foreground">Valor Total Anulado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ban className="h-5 w-5" />
              <span>Lista de Notas de Crédito</span>
            </CardTitle>
            <div className="relative max-w-sm mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por código, fatura ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <Ban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma nota de crédito encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Fatura Anulada</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((nc) => (
                    <TableRow key={nc.id}>
                      <TableCell className="font-mono font-medium">{nc.code}</TableCell>
                      <TableCell>
                        <Link to={`/invoice/${nc.document.id}`} className="font-mono text-primary hover:underline">
                          {nc.document.code}
                        </Link>
                      </TableCell>
                      <TableCell>{nc.document.client.name}</TableCell>
                      <TableCell>{formatDate(nc.createdAt)}</TableCell>
                      <TableCell className="text-destructive font-medium">{formatCurrency(nc.total)}</TableCell>
                      <TableCell>{nc.operator?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/credit-note/${nc.id}`} className="text-primary hover:underline text-sm">
                          Ver detalhes
                        </Link>
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
