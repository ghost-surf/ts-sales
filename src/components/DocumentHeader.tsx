import { useData } from "@/contexts/DataContext";

interface DocumentHeaderClient {
  name: string;
  address?: string | null;
  nuit?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface DocumentHeaderProps {
  client: DocumentHeaderClient | null;
  clientLabel?: string;
}

/**
 * Shared 3-column letterhead used by every printable document (cotação, fatura, recibo,
 * nota de crédito): logo | dados da empresa | dados do cliente. Compact by design so the
 * document body has more usable space on an A4 page.
 */
export function DocumentHeader({ client, clientLabel = "Cliente" }: DocumentHeaderProps) {
  const { companySettings } = useData();

  return (
    <div className="grid grid-cols-3 gap-3 text-xs leading-tight">
      <div className="flex items-center">
        {companySettings?.logo && (
          <img
            src={companySettings.logo}
            alt={companySettings.name}
            className="h-10 max-w-[130px] object-contain"
          />
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-0.5">{companySettings?.name ?? "Minha Empresa"}</h2>
        <div className="text-muted-foreground space-y-0">
          {companySettings?.address && <p>{companySettings.address}</p>}
          {companySettings?.nuit && <p>NUIT: {companySettings.nuit}</p>}
          {companySettings?.phone && <p>Tel: {companySettings.phone}</p>}
          {companySettings?.email && <p>Email: {companySettings.email}</p>}
          {companySettings?.website && <p>{companySettings.website}</p>}
        </div>
      </div>

      <div className="text-right">
        <h3 className="text-sm font-semibold mb-0.5">{clientLabel}</h3>
        {client ? (
          <div className="text-muted-foreground space-y-0">
            <p className="text-foreground">{client.name}</p>
            {client.address && <p>{client.address}</p>}
            {client.nuit && <p>NUIT: {client.nuit}</p>}
            {client.phone && <p>Tel: {client.phone}</p>}
            {client.email && <p>Email: {client.email}</p>}
          </div>
        ) : (
          <p className="text-muted-foreground">—</p>
        )}
      </div>
    </div>
  );
}
