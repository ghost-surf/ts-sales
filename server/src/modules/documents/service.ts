import { Prisma, Product } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { nextDocumentCode } from "../../utils/counters";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/errors";
import { CreateDocumentInput, ListDocumentsQuery, UpdateStatusInput } from "./schemas";
import { checkAndNotifyStock } from "../notifications/service";

type StockChange = { product: Product; previousStockQty: number };

async function notifyStockChanges(changes: StockChange[]) {
  await Promise.all(changes.map(({ product, previousStockQty }) => checkAndNotifyStock(product, previousStockQty)));
}

const detailInclude = {
  client: true,
  items: true,
  operator: { select: { id: true, name: true, email: true } },
  paymentLinks: { include: { payment: true } },
  sourceQuotation: { select: { id: true, code: true } },
  convertedInvoice: { select: { id: true, code: true } },
  creditNote: { select: { id: true, code: true } },
} satisfies Prisma.DocumentInclude;

type DocumentWithStatus = { type: string; status: string; dueDate: Date | null };

/** "Vencida"/"Expirada" are derived, not stored — computed from dueDate vs now. */
export function withDisplayStatus<T extends DocumentWithStatus>(doc: T) {
  const now = new Date();
  let displayStatus: string = doc.status;
  if (doc.status === "issued" && doc.dueDate && doc.dueDate < now) {
    displayStatus = doc.type === "FACT" ? "overdue" : "expired";
  }
  return { ...doc, displayStatus };
}

/** Documents fetched via `detailInclude` carry the full paymentLinks relation — reduce it to a paidAmount total. */
function withPaidAmount<T extends DocumentWithStatus & { paymentLinks: Array<{ amount: unknown }> }>(doc: T) {
  const paidAmount = doc.paymentLinks.reduce((sum, link) => sum + Number(link.amount), 0);
  return withDisplayStatus({ ...doc, paidAmount });
}

function transitions(type: "FACT" | "COT"): Record<string, string[]> {
  // Uma fatura emitida ou paga só pode ser anulada através de uma Nota de Crédito
  // (módulo creditNotes), que também reverte stock e caixa. Aqui só sobra draft->canceled,
  // que não tem nenhum efeito colateral a reverter.
  return type === "FACT"
    ? { draft: ["issued", "canceled"], issued: [], canceled: [], paid: [] }
    : {
        draft: ["issued", "canceled"],
        issued: ["accepted", "rejected", "canceled"],
        accepted: [],
        rejected: [],
        canceled: [],
      };
}

export async function list(query: ListDocumentsQuery) {
  const documents = await prisma.document.findMany({
    where: { type: query.type, status: query.status, clientId: query.clientId },
    include: {
      client: { select: { id: true, name: true } },
      paymentLinks: { select: { amount: true } },
      creditNote: { select: { id: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return documents.map(({ paymentLinks, ...doc }) =>
    withDisplayStatus({
      ...doc,
      paidAmount: paymentLinks.reduce((sum, link) => sum + Number(link.amount), 0),
    })
  );
}

export async function get(id: string) {
  const document = await prisma.document.findUnique({ where: { id }, include: detailInclude });
  if (!document) throw new NotFoundError("Documento não encontrado");
  return withPaidAmount(document);
}

export async function create(operatorId: string, input: CreateDocumentInput) {
  let stockChanges: StockChange[] = [];
  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw new NotFoundError("Cliente não encontrado");

    let subtotalProducts = 0;
    let subtotalServices = 0;
    const itemsData: Array<{
      itemType: "product" | "service";
      itemId: string;
      description: string;
      unitPrice: Prisma.Decimal;
      quantity: number;
      unit?: "metros" | "pcs" | "kg" | "litros";
      lineTotal: number;
    }> = [];

    for (const item of input.items) {
      if (item.itemType === "product") {
        const product = await tx.product.findUnique({ where: { id: item.itemId } });
        if (!product) throw new NotFoundError(`Produto ${item.itemId} não encontrado`);
        if (input.type === "FACT" && input.status === "issued" && Number(product.stockQty) < item.quantity) {
          throw new BadRequestError(`Stock insuficiente para "${product.name}"`);
        }
        const lineTotal = Number(product.price) * item.quantity;
        subtotalProducts += lineTotal;
        itemsData.push({
          itemType: "product",
          itemId: product.id,
          description: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          unit: product.unit,
          lineTotal,
        });
      } else {
        const service = await tx.service.findUnique({ where: { id: item.itemId } });
        if (!service) throw new NotFoundError(`Serviço ${item.itemId} não encontrado`);
        const lineTotal = Number(service.price) * item.quantity;
        subtotalServices += lineTotal;
        itemsData.push({
          itemType: "service",
          itemId: service.id,
          description: service.name,
          unitPrice: service.price,
          quantity: item.quantity,
          lineTotal,
        });
      }
    }

    const subtotal = subtotalProducts + subtotalServices;
    const discountValue = Math.min(input.discountValue, subtotal);
    const vatValue = input.vatApplied ? (subtotal - discountValue) * (input.taxPercentage / 100) : 0;
    const total = subtotal - discountValue + vatValue;

    const code = await nextDocumentCode(tx, input.type);

    const document = await tx.document.create({
      data: {
        type: input.type,
        code,
        clientId: input.clientId,
        operatorId,
        subtotalProducts,
        subtotalServices,
        discountApplied: discountValue > 0,
        vatApplied: input.vatApplied,
        discountValue,
        vatValue,
        total,
        status: input.status,
        dueDate: input.dueDate,
        items: { create: itemsData },
      },
      include: detailInclude,
    });

    if (input.type === "FACT" && input.status === "issued") {
      stockChanges = await debitStockForItems(tx, document.id, document.code, operatorId, itemsData);
    }

    return withPaidAmount(document);
  });

  await notifyStockChanges(stockChanges);
  return result;
}

async function debitStockForItems(
  tx: Prisma.TransactionClient,
  documentId: string,
  documentCode: string,
  operatorId: string,
  items: Array<{
    itemType: string;
    itemId: string;
    quantity: Prisma.Decimal | number | string;
    unit?: string | null;
  }>
): Promise<StockChange[]> {
  const changes: StockChange[] = [];
  for (const item of items) {
    if (item.itemType !== "product") continue;
    const updated = await tx.product.update({
      where: { id: item.itemId },
      data: { stockQty: { decrement: item.quantity } },
    });
    await tx.stockMovement.create({
      data: {
        productId: item.itemId,
        documentId,
        operatorId,
        type: "debit",
        quantity: item.quantity,
        unit: (item.unit as "metros" | "pcs" | "kg" | "litros") ?? "pcs",
        note: `Saída por documento ${documentCode}`,
      },
    });
    changes.push({ product: updated, previousStockQty: Number(updated.stockQty) + Number(item.quantity) });
  }
  return changes;
}

export async function updateStatus(id: string, operatorId: string, { status }: UpdateStatusInput) {
  let stockChanges: StockChange[] = [];
  const result = await prisma.$transaction(async (tx) => {
    const document = await tx.document.findUnique({ where: { id }, include: { items: true } });
    if (!document) throw new NotFoundError("Documento não encontrado");

    const allowed = transitions(document.type)[document.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestError(`Transição de estado inválida: ${document.status} -> ${status}`);
    }

    if (document.type === "FACT" && document.status === "draft" && status === "issued") {
      for (const item of document.items) {
        if (item.itemType !== "product") continue;
        const product = await tx.product.findUnique({ where: { id: item.itemId } });
        if (!product || Number(product.stockQty) < Number(item.quantity)) {
          throw new BadRequestError(`Stock insuficiente para "${item.description}"`);
        }
      }
      stockChanges = await debitStockForItems(tx, id, document.code, operatorId, document.items);
    }

    const updated = await tx.document.update({ where: { id }, data: { status }, include: detailInclude });
    return withPaidAmount(updated);
  });

  await notifyStockChanges(stockChanges);
  return result;
}

export async function convertToInvoice(quotationId: string, operatorId: string) {
  let stockChanges: StockChange[] = [];
  const result = await prisma.$transaction(async (tx) => {
    const quotation = await tx.document.findUnique({
      where: { id: quotationId },
      include: { items: true, convertedInvoice: true },
    });
    if (!quotation) throw new NotFoundError("Cotação não encontrada");
    if (quotation.type !== "COT") throw new BadRequestError("Documento não é uma cotação");
    if (quotation.convertedInvoice) throw new ConflictError("Cotação já foi convertida em fatura");
    if (["rejected", "canceled"].includes(quotation.status)) {
      throw new BadRequestError("Cotação rejeitada ou cancelada não pode ser convertida");
    }

    for (const item of quotation.items) {
      if (item.itemType !== "product") continue;
      const product = await tx.product.findUnique({ where: { id: item.itemId } });
      if (!product || Number(product.stockQty) < Number(item.quantity)) {
        throw new BadRequestError(`Stock insuficiente para "${item.description}"`);
      }
    }

    const code = await nextDocumentCode(tx, "FACT");
    const invoice = await tx.document.create({
      data: {
        type: "FACT",
        code,
        clientId: quotation.clientId,
        operatorId,
        subtotalProducts: quotation.subtotalProducts,
        subtotalServices: quotation.subtotalServices,
        discountApplied: quotation.discountApplied,
        vatApplied: quotation.vatApplied,
        discountValue: quotation.discountValue,
        vatValue: quotation.vatValue,
        total: quotation.total,
        status: "issued",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sourceQuotationId: quotation.id,
        items: {
          create: quotation.items.map((item) => ({
            itemType: item.itemType,
            itemId: item.itemId,
            description: item.description,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            unit: item.unit,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: detailInclude,
    });

    stockChanges = await debitStockForItems(tx, invoice.id, quotation.code, operatorId, quotation.items);
    await tx.document.update({ where: { id: quotation.id }, data: { status: "accepted" } });

    return withPaidAmount(invoice);
  });

  await notifyStockChanges(stockChanges);
  return result;
}
