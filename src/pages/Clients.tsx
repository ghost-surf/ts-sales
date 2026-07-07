import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Users, Edit, Trash2, Eye } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { ApiError } from "@/lib/api";
import { usePagination } from "@/hooks/use-pagination";
import { TablePagination } from "@/components/TablePagination";

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const confirm = useConfirm();

  const [formData, setFormData] = useState({
    name: "",
    nuit: "",
    address: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ok = await confirm({
      title: editingClient ? "Atualizar cliente?" : "Criar cliente?",
      confirmLabel: editingClient ? "Atualizar" : "Criar",
    });
    if (!ok) return;

    try {
      if (editingClient) {
        await updateClient(editingClient.id, {
          name: formData.name,
          nuit: formData.nuit,
          address: formData.address,
          phone: formData.phone,
          email: formData.email
        });

        toast({
          title: "Cliente atualizado!",
          description: "O cliente foi atualizado com sucesso."
        });
      } else {
        await addClient({
          name: formData.name,
          nuit: formData.nuit,
          address: formData.address,
          phone: formData.phone,
          email: formData.email
        });

        toast({
          title: "Cliente criado!",
          description: "O novo cliente foi criado com sucesso."
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

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      nuit: client.nuit || "",
      address: client.address || "",
      phone: client.phone || "",
      email: client.email || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar cliente?",
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteClient(id);

      toast({
        title: "Cliente eliminado!",
        description: "O cliente foi eliminado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao eliminar cliente",
        description: error instanceof ApiError ? error.message : "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nuit: "",
      address: "",
      phone: "",
      email: "",
    });
    setEditingClient(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone || "").includes(searchTerm)
  );

  const { pageItems, page, setPage, pageSize, setPageSize, totalPages, totalItems } = usePagination(filteredClients);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">
              Gestão da carteira de clientes
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleDialogClose())}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Construções Silva Lda"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nuit">NUIT</Label>
                  <Input
                    id="nuit"
                    value={formData.nuit}
                    onChange={(e) => setFormData({...formData, nuit: e.target.value})}
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="cliente@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+258 84 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Endereço completo do cliente"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingClient ? 'Atualizar' : 'Criar'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{clients.length}</p>
                  <p className="text-sm text-muted-foreground">Total Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold text-success">{clients.length}</p>
                  <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-info" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Novos este Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisar Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardContent className="p-0">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Tente alterar os critérios de pesquisa' : 'Clique em "Novo Cliente" para adicionar o primeiro cliente'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <Link to={`/clients/${client.id}`} className="font-medium hover:text-primary hover:underline">
                            {client.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{client.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{client.email}</p>
                          <p className="text-sm text-muted-foreground">{client.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(client.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/clients/${client.id}`}>
                            <Button variant="outline" size="sm" title="Ver detalhes">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
