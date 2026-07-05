import { prisma } from "../../lib/prisma";
import { nextDocumentCode } from "../../utils/counters";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import { CreatePaymentInput } from "./schemas";

const include = {
  operator: { select: { id: true, name: true, email: true } },
  documents: { include: { document: { select: { id: true, code: true, type: true, total: true, clientId: true } } } },
} as const;

export function list() {
  return prisma.payment.findMany({ include, orderBy: { paymentDate: "desc" } });
}

export async function get(id: string) {
  const payment = await prisma.payment.findUnique({ where: { id }, include });
  if (!payment) throw new NotFoundError("Recibo não encontrado");
  return payment;
}

export async function create(operatorId: string, input: CreatePaymentInput) {
  return prisma.$transaction(async (tx) => {
    let amount = 0;

    for (const allocation of input.allocations) {
      const document = await tx.document.findUnique({
        where: { id: allocation.documentId },
        include: { paymentLinks: true },
      });
      if (!document) throw new NotFoundError(`Documento ${allocation.documentId} não encontrado`);
      if (document.type !== "FACT") throw new BadRequestError("Só é possível registar pagamentos para faturas");
      if (document.status === "canceled") throw new BadRequestError(`Fatura ${document.code} está cancelada`);

      const alreadyPaid = document.paymentLinks.reduce((sum, link) => sum + Number(link.amount), 0);
      const remaining = Number(document.total) - alreadyPaid;
      if (allocation.amount > remaining + 0.01) {
        throw new BadRequestError(
          `Valor alocado para ${document.code} excede o saldo em aberto (${remaining.toFixed(2)})`
        );
      }

      amount += allocation.amount;
    }

    const receiptCode = await nextDocumentCode(tx, "REC");

    const payment = await tx.payment.create({
      data: {
        receiptCode,
        method: input.method,
        chequeNumber: input.method === "cheque" ? input.chequeNumber : null,
        amount,
        operatorId,
        documents: {
          create: input.allocations.map((allocation) => ({
            documentId: allocation.documentId,
            amount: allocation.amount,
          })),
        },
      },
      include,
    });

    for (const allocation of input.allocations) {
      const document = await tx.document.findUniqueOrThrow({
        where: { id: allocation.documentId },
        include: { paymentLinks: true },
      });
      const totalPaid = document.paymentLinks.reduce((sum, link) => sum + Number(link.amount), 0);
      if (totalPaid >= Number(document.total) - 0.01 && document.status !== "paid") {
        await tx.document.update({ where: { id: document.id }, data: { status: "paid" } });
      }
    }

    return payment;
  });
}
