import { useData } from "@/contexts/DataContext";

/** Banking details shown in the footer of invoices, quotations and receipts — pulled from Settings. */
export function DocumentBankDetails() {
  const { companySettings } = useData();

  if (!companySettings?.bankName && !companySettings?.bankAccountHolder && !companySettings?.bankIban) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-muted/20 rounded-lg text-sm">
      <p className="font-medium mb-1">Dados Bancários</p>
      {companySettings.bankName && <p>Banco: {companySettings.bankName}</p>}
      {companySettings.bankAccountHolder && <p>Titular: {companySettings.bankAccountHolder}</p>}
      {companySettings.bankIban && <p>NIB/IBAN: {companySettings.bankIban}</p>}
    </div>
  );
}
