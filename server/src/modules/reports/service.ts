import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { withDisplayStatus } from "../documents/service";

function dateRangeWhere(from?: Date, to?: Date): Prisma.DocumentWhereInput {
  if (!from && !to) return {};
  const createdAt: Prisma.DateTimeFilter = {};
  if (from) createdAt.gte = from;
  if (to) createdAt.lte = to;
  return { createdAt };
}

export async function salesReport(from?: Date, to?: Date) {
  const invoices = await prisma.document.findMany({
    where: { type: "FACT", status: "paid", ...dateRangeWhere(from, to) },
    orderBy: { createdAt: "asc" },
  });

  const byDay = new Map<string, { date: string; totalSales: number; ordersCount: number }>();
  for (const invoice of invoices) {
    const day = invoice.createdAt.toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { date: day, totalSales: 0, ordersCount: 0 };
    entry.totalSales += Number(invoice.total);
    entry.ordersCount += 1;
    byDay.set(day, entry);
  }

  const series = [...byDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({ ...entry, avgOrderValue: entry.totalSales / entry.ordersCount }));

  const totalSales = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const ordersCount = invoices.length;

  return {
    series,
    totals: { totalSales, ordersCount, avgOrderValue: ordersCount ? totalSales / ordersCount : 0 },
  };
}

export async function stockReport() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });

  return products.map((product) => {
    const stock = Number(product.stockQty);
    const threshold = Number(product.lowStockThreshold);
    const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
    return {
      productId: product.id,
      name: product.name,
      categoryName: product.category.name,
      stock,
      unit: product.unit,
      stockValue: stock * Number(product.price),
      status,
    };
  });
}

export async function topClients(from: Date | undefined, to: Date | undefined, limit: number) {
  const invoices = await prisma.document.findMany({
    where: { type: "FACT", status: "paid", ...dateRangeWhere(from, to) },
    include: { client: { select: { id: true, name: true } } },
  });

  const byClient = new Map<string, { clientId: string; clientName: string; totalPurchases: number; ordersCount: number }>();
  for (const invoice of invoices) {
    const entry = byClient.get(invoice.clientId) ?? {
      clientId: invoice.clientId,
      clientName: invoice.client.name,
      totalPurchases: 0,
      ordersCount: 0,
    };
    entry.totalPurchases += Number(invoice.total);
    entry.ordersCount += 1;
    byClient.set(invoice.clientId, entry);
  }

  return [...byClient.values()]
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
    .slice(0, limit);
}

export async function dashboard() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todayInvoices, products, clientsCount, recentInvoices, recentQuotations] = await Promise.all([
    prisma.document.findMany({
      where: { type: "FACT", status: "paid", createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.product.findMany(),
    prisma.client.count(),
    prisma.document.findMany({
      where: { type: "FACT" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { client: { select: { name: true } } },
    }),
    prisma.document.findMany({
      where: { type: "COT" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { client: { select: { name: true } } },
    }),
  ]);

  const todaySales = todayInvoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const totalStockUnits = products.reduce((sum, product) => sum + Number(product.stockQty), 0);
  const lowStockCount = products.filter(
    (product) => Number(product.stockQty) <= Number(product.lowStockThreshold)
  ).length;

  return {
    todaySales,
    todayInvoicesCount: todayInvoices.length,
    totalStockUnits,
    totalProducts: products.length,
    lowStockCount,
    clientsCount,
    recentInvoices: recentInvoices.map(withDisplayStatus),
    recentQuotations: recentQuotations.map(withDisplayStatus),
  };
}
