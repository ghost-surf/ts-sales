import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { documentStatusLabel, documentStatusVariant } from "@/lib/statusLabels";
import { DisplayStatus } from "@/types";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";
import { formatCurrency, formatDate } from "@/lib/format";
import { toDateKey } from "@/lib/utils";

export default function Quotations() {
  const { getQuotations } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return toDateKey(thirtyDaysAgo);
  });
  const [dateTo, setDateTo] = useState<string>(() => toDateKey(new Date()));

  const quotations = getQuotations();

  const dateFilteredQuotations = quotations.filter((quotation) => {
    const key = toDateKey(new Date(quotation.createdAt));
    if (dateFrom && key < dateFrom) return false;
    if (dateTo && key > dateTo) return false;
    return true;
  });

  const filtered = dateFilteredQuotations.filter((quotation) => {
    const matchesSearch =
      quotation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quotation.displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems } = usePagination(filtered);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cotações</h1>
          <p className="text-muted-foreground">Todas as cotações criadas</p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{dateFilteredQuotations.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{dateFilteredQuotations.filter(q => q.displayStatus === "issued").length}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{dateFilteredQuotations.filter(q => q.displayStatus === "accepted").length}</p>
              <p className="text-sm text-muted-foreground">Aceites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">
                {dateFilteredQuotations.filter(q => q.displayStatus === "rejected" || q.displayStatus === "expired").length}
              </p>
              <p className="text-sm text-muted-foreground">Rejeitadas/Expiradas</p>
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
                  placeholder="Pesquisar por código ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="issued">Pendente</SelectItem>
                  <SelectItem value="accepted">Aceite</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma cotação encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-mono font-medium">{quotation.code}</TableCell>
                      <TableCell>{quotation.clientName}</TableCell>
                      <TableCell>{formatDate(quotation.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(quotation.total)}</TableCell>
                      <TableCell>
                        <Badge variant={documentStatusVariant(quotation.displayStatus)}>
                          {documentStatusLabel("COT", quotation.displayStatus as DisplayStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/quotation/${quotation.id}`} className="text-primary hover:underline text-sm">
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
