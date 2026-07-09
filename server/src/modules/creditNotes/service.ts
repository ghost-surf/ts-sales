import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { nextDocumentCode } from "../../utils/counters";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/errors";
import { CreateCreditNoteInput } from "./schemas";
import { notifyCreditNoteIssued } from "../notifications/service";

const include = {
  document: {
    select: {
      id: true,
      code: true,
      type: true,
      total: true,
      status: true,
      createdAt: true,
      client: { select: { id: true, name: true, nuit: true, email: true, phone: true, address: true } },
      items: true,
    },
  },
  operator: { select: { id: true, name: true, email: true } },
} satisfies Prisma.CreditNoteInclude;

export function list() {
  return prisma.creditNote.findMany({ include, orderBy: { createdAt: "desc" } });
}

export async function get(id: string) {
  const creditNote = await prisma.creditNote.findUnique({ where: { id }, include });
  if (!creditNote) throw new NotFoundError("Nota de crédito não encontrada");
  return creditNote;
}

export async function create(operatorId: string, input: CreateCreditNoteInput) {
  const creditNote = await prisma.$transaction(async (tx) => {
    const invoice = await tx.document.findUnique({
      where: { id: input.documentId },
      include: { items: true, paymentLinks: true, creditNote: true },
    });
    if (!invoice) throw new NotFoundError("Fatura não encontrada");
    if (invoice.type !== "FACT") throw new BadRequestError("Só é possível emitir Nota de Crédito para faturas");
    if (invoice.status === "canceled" || invoice.creditNote) {
      throw new ConflictError("Fatura já foi anulada");
    }
    if (invoice.status === "draft") {
      throw new BadRequestError(
        "Fatura em rascunho ainda não movimentou stock nem pagamento — cancele-a diretamente"
      );
    }

    const ncCode = await nextDocumentCode(tx, "NC");

    // Reposição automática de stock: reverte a saída de cada item vendido.
    for (const item of invoice.items) {
      if (item.itemType !== "product") continue;
      await tx.product.update({
        where: { id: item.itemId },
        data: { stockQty: { increment: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.itemId,
          documentId: invoice.id,
          operatorId,
          type: "credit",
          quantity: item.quantity,
          unit: item.unit ?? "pcs",
          note: `Anulação de fatura ${invoice.code} — Nota de Crédito ${ncCode}`,
        },
      });
    }

    // Reversão de caixa: para cada alocação de pagamento já recebida nesta fatura,
    // regista um pagamento de estorno com o mesmo método e valor negativo — o saldo
    // por método (numerário/transferência/cheque) fica automaticamente correto.
    for (const allocation of invoice.paymentLinks) {
      const amount = Number(allocation.amount);
      if (amount <= 0) continue;
      const originalPayment = await tx.payment.findUnique({ where: { id: allocation.paymentId } });
      if (!originalPayment) continue;

      const estCode = await nextDocumentCode(tx, "EST");
      await tx.payment.create({
        data: {
          receiptCode: estCode,
          method: originalPayment.method,
          chequeNumber: originalPayment.chequeNumber,
          amount: -amount,
          kind: "reversal",
          operatorId,
          documents: { create: [{ documentId: invoice.id, amount: -amount }] },
        },
      });
    }

    await tx.creditNote.create({
      data: {
        code: ncCode,
        documentId: invoice.id,
        operatorId,
        total: invoice.total,
        reason: input.reason,
      },
    });

    await tx.document.update({ where: { id: invoice.id }, data: { status: "canceled" } });

    return tx.creditNote.findUniqueOrThrow({ where: { documentId: invoice.id }, include });
  });

  await notifyCreditNoteIssued(creditNote);
  return creditNote;
}
