import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Upload, X, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { ApiError } from "@/lib/api";

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB

export default function Settings() {
  const { companySettings, updateCompanySettings } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    nuit: "",
    phone: "",
    website: "",
    bankName: "",
    bankAccountHolder: "",
    bankIban: "",
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companySettings) return;
    setFormData({
      name: companySettings.name ?? "",
      address: companySettings.address ?? "",
      email: companySettings.email ?? "",
      nuit: companySettings.nuit ?? "",
      phone: companySettings.phone ?? "",
      website: companySettings.website ?? "",
      bankName: companySettings.bankName ?? "",
      bankAccountHolder: companySettings.bankAccountHolder ?? "",
      bankIban: companySettings.bankIban ?? "",
    });
    setLogo(companySettings.logo ?? null);
  }, [companySettings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione um ficheiro de imagem", variant: "destructive" });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast({ title: "Erro", description: "A imagem deve ter no máximo 2MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompanySettings({
        name: formData.name,
        address: formData.address || null,
        email: formData.email || null,
        nuit: formData.nuit || null,
        phone: formData.phone || null,
        website: formData.website || null,
        logo,
        bankName: formData.bankName || null,
        bankAccountHolder: formData.bankAccountHolder || null,
        bankIban: formData.bankIban || null,
      });
      toast({ title: "Definições guardadas!", description: "Os dados da empresa foram atualizados com sucesso." });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof ApiError ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Definições</h1>
          <p className="text-muted-foreground">Dados da empresa exibidos em faturas, cotações e recibos</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Dados da Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Logotipo</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="w-20 h-20 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden shrink-0">
                    {logo ? (
                      <img src={logo} alt="Logotipo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Carregar Imagem
                    </Button>
                    {logo && (
                      <Button type="button" variant="outline" onClick={() => setLogo(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Nome da sua empresa"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo da empresa"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="empresa@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+258 21 123 456"
                  />
                </div>
                <div>
                  <Label htmlFor="nuit">NUIT</Label>
                  <Input
                    id="nuit"
                    value={formData.nuit}
                    onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.empresa.com"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Landmark className="h-5 w-5" />
                <span>Dados Bancários</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Exibidos no rodapé das faturas, cotações e recibos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Banco</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Ex: Millennium bim"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountHolder">Titular da Conta</Label>
                  <Input
                    id="bankAccountHolder"
                    value={formData.bankAccountHolder}
                    onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                    placeholder="Nome do titular"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bankIban">NIB / IBAN</Label>
                  <Input
                    id="bankIban"
                    value={formData.bankIban}
                    onChange={(e) => setFormData({ ...formData, bankIban: e.target.value })}
                    placeholder="0000 0000 0000 0000 0000 0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="mt-6">
            {saving ? "A guardar..." : "Guardar Definições"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
