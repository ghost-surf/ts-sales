import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, Edit, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  unit: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_qty: number;
  unit: 'metros' | 'pcs';
  low_stock_threshold: number;
  category_id: string;
  created_at: string;
  updated_at: string;
  categories: Category;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_qty: "",
    unit: "metros" as 'metros' | 'pcs',
    low_stock_threshold: "",
    category_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              unit
            )
          `)
          .order('name'),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id || !formData.unit) return;

    setSaving(true);
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock_qty: parseFloat(formData.stock_qty) || 0,
            unit: formData.unit,
            low_stock_threshold: parseFloat(formData.low_stock_threshold) || 0,
            category_id: formData.category_id,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock_qty: parseFloat(formData.stock_qty) || 0,
            unit: formData.unit,
            low_stock_threshold: parseFloat(formData.low_stock_threshold) || 0,
            category_id: formData.category_id,
          }]);

        if (error) throw error;
        toast.success('Produto criado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao guardar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock_qty: product.stock_qty.toString(),
      unit: product.unit,
      low_stock_threshold: product.low_stock_threshold.toString(),
      category_id: product.category_id,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Produto eliminado com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao eliminar produto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_qty: "",
      unit: "metros",
      low_stock_threshold: "",
      category_id: "",
    });
    setEditingProduct(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground">
              Gestão do catálogo de produtos hidráulicos
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData({...formData, category_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value: 'metros' | 'pcs') => setFormData({...formData, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metros">Metros</SelectItem>
                        <SelectItem value="pcs">Peças (pcs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Tubo 1/2&quot; Alta Pressão"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrição detalhada do produto"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Preço (MTN)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_qty">Stock Atual</Label>
                    <Input
                      id="stock_qty"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.stock_qty}
                      onChange={(e) => setFormData({...formData, stock_qty: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="low_stock_threshold">Alerta Stock Mínimo</Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      editingProduct ? 'Atualizar' : 'Criar'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                     <p className="text-2xl font-bold">{products.length}</p>
                   <p className="text-sm text-muted-foreground">Total Produtos</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center space-x-2">
                 <AlertTriangle className="h-5 w-5 text-warning" />
                 <div>
                   <p className="text-2xl font-bold text-warning">
                     {products.filter(p => p.stock_qty <= p.low_stock_threshold).length}
                   </p>
                   <p className="text-sm text-muted-foreground">Stock Baixo</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <div>
                 <p className="text-2xl font-bold">{categories.length}</p>
                 <p className="text-sm text-muted-foreground">Categorias</p>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <div>
                 <p className="text-2xl font-bold">
                   {products.reduce((sum, p) => sum + (p.price * p.stock_qty), 0).toFixed(2)} MTN
                 </p>
                 <p className="text-sm text-muted-foreground">Valor Total Stock</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                     </TableCell>
                     <TableCell>
                       <Badge variant="secondary">{product.categories.name}</Badge>
                     </TableCell>
                     <TableCell>{product.price.toFixed(2)} MTN</TableCell>
                     <TableCell>
                       <span className={product.stock_qty <= product.low_stock_threshold ? "text-warning font-medium" : ""}>
                         {product.stock_qty} {product.unit}
                       </span>
                       {product.stock_qty <= product.low_stock_threshold && (
                         <div className="text-xs text-warning">
                           Min: {product.low_stock_threshold} {product.unit}
                         </div>
                       )}
                     </TableCell>
                     <TableCell>
                       {product.stock_qty <= product.low_stock_threshold ? (
                         <Badge variant="destructive" className="bg-warning text-warning-foreground">
                           <AlertTriangle className="h-3 w-3 mr-1" />
                           Stock Baixo
                         </Badge>
                       ) : (
                         <Badge variant="secondary" className="bg-success/10 text-success">
                           Disponível
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex justify-end space-x-2">
                         <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}