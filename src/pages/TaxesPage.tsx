import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calculator } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { ApiError } from "@/lib/api";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";

export default function TaxesPage() {
  const { taxes, addTax, updateTax, deleteTax } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    percentage: ""
  });
  const { toast } = useToast();
  const confirm = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ok = await confirm({
      title: editingTax ? "Atualizar imposto?" : "Criar imposto?",
      confirmLabel: editingTax ? "Atualizar" : "Criar",
    });
    if (!ok) return;

    try {
      if (editingTax) {
        await updateTax(editingTax.id, {
          name: formData.name,
          percentage: parseFloat(formData.percentage)
        });

        toast({
          title: "Imposto atualizado!",
          description: "O imposto foi atualizado com sucesso."
        });
      } else {
        await addTax({
          name: formData.name,
          percentage: parseFloat(formData.percentage)
        });
        
        toast({
          title: "Imposto criado!",
          description: "O novo imposto foi criado com sucesso."
        });
      }

      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (tax: any) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      percentage: tax.percentage.toString()
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar imposto?",
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteTax(id);

      toast({
        title: "Imposto eliminado!",
        description: "O imposto foi eliminado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao eliminar imposto",
        description: error instanceof ApiError ? error.message : "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", percentage: "" });
    setEditingTax(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems } = usePagination(taxes);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Impostos</h1>
            <p className="text-muted-foreground">
              Gestão de impostos aplicáveis às vendas
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleDialogClose())}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Imposto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTax ? 'Editar Imposto' : 'Novo Imposto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Imposto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: IVA"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="percentage">Percentual (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                    placeholder="17"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingTax ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Lista de Impostos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={taxes.length === 0 ? undefined : "p-0"}>
            {taxes.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum imposto encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Novo Imposto" para adicionar o primeiro imposto
                </p>
              </div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium">{tax.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tax.percentage}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(tax)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tax.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}