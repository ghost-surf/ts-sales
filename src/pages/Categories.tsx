import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { ApiError } from "@/lib/api";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";
import { unitLabel } from "@/lib/statusLabels";
import { formatDate } from "@/lib/format";
import { UnitType } from "@/types";

export default function Categories() {
  const { getProductCategories, addCategory, updateCategory, deleteCategory } = useData();
  const categories = getProductCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "pcs" as UnitType,
  });
  const { toast } = useToast();
  const confirm = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ok = await confirm({
      title: editingCategory ? "Atualizar categoria?" : "Criar categoria?",
      confirmLabel: editingCategory ? "Atualizar" : "Criar",
    });
    if (!ok) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          unit: formData.unit,
        });

        toast({
          title: "Categoria atualizada!",
          description: "A categoria foi atualizada com sucesso."
        });
      } else {
        await addCategory({
          name: formData.name,
          type: "product",
          unit: formData.unit,
        });

        toast({
          title: "Categoria criada!",
          description: "A nova categoria foi criada com sucesso."
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

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      unit: category.unit ?? "pcs",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar categoria?",
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteCategory(id);

      toast({
        title: "Categoria eliminada!",
        description: "A categoria foi eliminada com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao eliminar categoria",
        description: error instanceof ApiError ? error.message : "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", unit: "pcs" });
    setEditingCategory(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems } = usePagination(categories);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categorias de Produtos</h1>
            <p className="text-muted-foreground">
              Gerir categorias usadas no catálogo de produtos
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleDialogClose())}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria de Produtos'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Tubagem PVC"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unidade de Medida</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: UnitType) => setFormData({...formData, unit: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Peças (pcs)</SelectItem>
                      <SelectItem value="metros">Metros</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="litros">Litros (L)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingCategory ? 'Atualizar' : 'Criar'}
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
            <CardTitle>Lista de Categorias de Produtos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma categoria encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.unit ? unitLabel(category.unit) : "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(category.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
