import { useData } from "@/contexts/DataContext";

/** Company header shown on invoices, quotations and receipts — pulled from Settings. */
export function CompanyLetterhead() {
  const { companySettings } = useData();

  return (
    <div>
      {companySettings?.logo && (
        <img
          src={companySettings.logo}
          alt={companySettings.name}
          className="h-24 max-w-[220px] object-contain mb-3"
        />
      )}
      <h2 className="text-xl font-semibold mb-2">{companySettings?.name ?? "Minha Empresa"}</h2>
      <p className="text-sm text-muted-foreground">
        {companySettings?.address && (
          <>
            {companySettings.address}
            <br />
          </>
        )}
        {companySettings?.phone && (
          <>
            Tel: {companySettings.phone}
            <br />
          </>
        )}
        {companySettings?.email && (
          <>
            Email: {companySettings.email}
            <br />
          </>
        )}
        {companySettings?.website && (
          <>
            {companySettings.website}
            <br />
          </>
        )}
        {companySettings?.nuit && <>NUIT: {companySettings.nuit}</>}
      </p>
    </div>
  );
}
