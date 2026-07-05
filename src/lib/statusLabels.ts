import { DisplayStatus, DocumentType } from "@/types";

const INVOICE_LABELS: Record<DisplayStatus, string> = {
  draft: "Rascunho",
  issued: "Pendente",
  paid: "Paga",
  canceled: "Cancelada",
  overdue: "Vencida",
  accepted: "Aceite",
  rejected: "Rejeitada",
  expired: "Expirada",
};

const QUOTATION_LABELS: Record<DisplayStatus, string> = {
  draft: "Rascunho",
  issued: "Pendente",
  accepted: "Aceite",
  rejected: "Rejeitada",
  expired: "Expirada",
  canceled: "Cancelada",
  paid: "Paga",
  overdue: "Vencida",
};

export function documentStatusLabel(type: DocumentType, status: DisplayStatus): string {
  return (type === "FACT" ? INVOICE_LABELS : QUOTATION_LABELS)[status] ?? status;
}

export function documentStatusVariant(status: DisplayStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
    case "accepted":
      return "default";
    case "issued":
    case "draft":
      return "secondary";
    case "rejected":
    case "canceled":
    case "overdue":
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
}
