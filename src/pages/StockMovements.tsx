import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Search, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";
import { normalizeSearch, toDateKey } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

export default function StockMovements() {
  const { stockMovements, refreshStockMovements } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return toDateKey(thirtyDaysAgo);
  });
  const [dateTo, setDateTo] = useState<string>(() => toDateKey(new Date()));

  useEffect(() => {
    refreshStockMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateFilteredMovements = stockMovements.filter((movement) => {
    const key = toDateKey(new Date(movement.createdAt));
    if (dateFrom && key < dateFrom) return false;
    if (dateTo && key > dateTo) return false;
    return true;
  });

  const filtered = dateFilteredMovements.filter((movement) => {
    const matchesSearch =
      normalizeSearch(movement.product.name).includes(normalizeSearch(searchTerm)) ||
      normalizeSearch(movement.operator?.name ?? "").includes(normalizeSearch(searchTerm)) ||
      normalizeSearch(movement.document?.code ?? "").includes(normalizeSearch(searchTerm));
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems } = usePagination(filtered);

  const totalIn = dateFilteredMovements.filter((m) => m.type === "credit").reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = dateFilteredMovements.filter((m) => m.type === "debit").reduce((sum, m) => sum + m.quantity, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Movimentações de Stock</h1>
          <p className="text-muted-foreground">
            Histórico de entradas e saídas de stock — quem atualizou, que produto e que quantidade
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="max-w-48">
            <Label htmlFor="date-from">Data Inicial</Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="max-w-48">
            <Label htmlFor="date-to">Data Final</Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{dateFilteredMovements.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Movimentações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <ArrowUpCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold text-success">{totalIn.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Entradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <ArrowDownCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-warning">{totalOut.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Saídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por produto, operador ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="credit">Entrada</SelectItem>
                  <SelectItem value="debit">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(movement.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">{movement.product.name}</TableCell>
                      <TableCell>
                        {movement.type === "credit" ? (
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            <ArrowUpCircle className="h-3 w-3 mr-1" />
                            Entrada
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-warning/10 text-warning">
                            <ArrowDownCircle className="h-3 w-3 mr-1" />
                            Saída
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {movement.quantity} {movement.unit}
                      </TableCell>
                      <TableCell>{movement.operator?.name ?? "—"}</TableCell>
                      <TableCell>
                        {movement.document ? (
                          <Link
                            to={`/${movement.document.type === "FACT" ? "invoice" : "quotation"}/${movement.document.id}`}
                            className="font-mono text-primary hover:underline"
                          >
                            {movement.document.code}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{movement.note ?? "—"}</TableCell>
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
