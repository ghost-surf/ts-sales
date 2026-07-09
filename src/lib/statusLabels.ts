import { DisplayStatus, DocumentType, PaymentMethod, UnitType } from "@/types";

const UNIT_LABELS: Record<UnitType, string> = {
  pcs: "Peças (pcs)",
  metros: "Metros",
  kg: "Quilogramas (kg)",
  litros: "Litros (L)",
};

export function unitLabel(unit: UnitType): string {
  return UNIT_LABELS[unit] ?? unit;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  numerario: "Numerário",
  cheque: "Cheque",
  transferencia: "Transferência",
};

export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

const INVOICE_LABELS: Record<DisplayStatus, string> = {
  draft: "Rascunho",
  issued: "Pendente",
  paid: "Paga",
  canceled: "Anulada",
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
