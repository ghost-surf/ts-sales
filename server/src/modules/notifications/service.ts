import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { sendMail } from "../../lib/mail";
import { env } from "../../lib/env";

type Numeric = number | string | Prisma.Decimal;

async function getRecipients(): Promise<string[]> {
  const settings = await prisma.companySettings.findUnique({ where: { id: "company" } });
  if (settings?.notificationEmail) return [settings.notificationEmail];

  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { email: true } });
  return admins.map((admin) => admin.email);
}

function productLink(name: string) {
  return env.appUrl ? `${env.appUrl}/products?search=${encodeURIComponent(name)}` : null;
}

function invoiceLink(id: string) {
  return env.appUrl ? `${env.appUrl}/invoice/${id}` : null;
}

function creditNoteLink(id: string) {
  return env.appUrl ? `${env.appUrl}/credit-note/${id}` : null;
}

function wrapHtml(title: string, bodyHtml: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #1e293b;">${title}</h2>
      ${bodyHtml}
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Notificação automática do TS Sales.</p>
    </div>
  `;
}

export async function notifyStockThresholdCrossed(product: {
  id: string;
  name: string;
  stockQty: Numeric;
  lowStockThreshold: Numeric;
  unit: string;
}) {
  const stock = Number(product.stockQty);
  const threshold = Number(product.lowStockThreshold);
  const link = productLink(product.name);
  const linkHtml = link ? `<p><a href="${link}">Ver produto</a></p>` : "";

  if (stock <= 0) {
    await sendMail({
      to: await getRecipients(),
      subject: `Stock esgotado: ${product.name}`,
      html: wrapHtml("Produto sem stock", `
        <p><strong>${product.name}</strong> chegou a <strong>0 ${product.unit}</strong> em stock.</p>
        ${linkHtml}
      `),
    });
    return;
  }

  await sendMail({
    to: await getRecipients(),
    subject: `Stock baixo: ${product.name}`,
    html: wrapHtml("Alerta de stock baixo", `
      <p><strong>${product.name}</strong> está com <strong>${stock} ${product.unit}</strong> em stock,
      abaixo (ou igual) do limite mínimo definido de <strong>${threshold} ${product.unit}</strong>.</p>
      ${linkHtml}
    `),
  });
}

/** Only alerts when stock decreases and crosses into "low" or "out of stock" — never re-fires on every sale while already low. */
export async function checkAndNotifyStock(
  product: { id: string; name: string; stockQty: Numeric; lowStockThreshold: Numeric; unit: string },
  previousStockQty: Numeric
) {
  const before = Number(previousStockQty);
  const after = Number(product.stockQty);
  if (after >= before) return;

  const threshold = Number(product.lowStockThreshold);
  const crossedIntoLow = before > threshold && after <= threshold;
  const crossedIntoZero = before > 0 && after <= 0;
  if (crossedIntoLow || crossedIntoZero) {
    await notifyStockThresholdCrossed(product);
  }
}

export async function notifyCreditNoteIssued(creditNote: {
  id: string;
  code: string;
  total: Numeric;
  reason?: string | null;
  document: { id: string; code: string };
}) {
  const link = creditNoteLink(creditNote.id);
  const linkHtml = link ? `<p><a href="${link}">Ver nota de crédito</a></p>` : "";

  await sendMail({
    to: await getRecipients(),
    subject: `Nota de Crédito emitida: ${creditNote.code}`,
    html: wrapHtml("Fatura anulada", `
      <p>A fatura <strong>${creditNote.document.code}</strong> foi anulada pela nota de crédito
      <strong>${creditNote.code}</strong>, no valor de <strong>${Number(creditNote.total).toFixed(2)} MTN</strong>.</p>
      ${creditNote.reason ? `<p>Motivo: ${creditNote.reason}</p>` : ""}
      ${linkHtml}
    `),
  });
}

export async function notifyOverdueInvoices(
  invoices: Array<{ id: string; code: string; total: Numeric; clientName: string; dueDate: Date | null }>
) {
  if (invoices.length === 0) return;

  const rows = invoices
    .map((invoice) => {
      const link = invoiceLink(invoice.id);
      const codeCell = link ? `<a href="${link}">${invoice.code}</a>` : invoice.code;
      return `
        <tr>
          <td style="padding: 4px 8px; border-bottom: 1px solid #e2e8f0;">${codeCell}</td>
          <td style="padding: 4px 8px; border-bottom: 1px solid #e2e8f0;">${invoice.clientName}</td>
          <td style="padding: 4px 8px; border-bottom: 1px solid #e2e8f0;">${Number(invoice.total).toFixed(2)} MTN</td>
          <td style="padding: 4px 8px; border-bottom: 1px solid #e2e8f0;">${
            invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("pt-PT") : "—"
          }</td>
        </tr>
      `;
    })
    .join("");

  await sendMail({
    to: await getRecipients(),
    subject: `${invoices.length} fatura(s) vencida(s) por pagar`,
    html: wrapHtml("Faturas vencidas", `
      <p>As seguintes faturas estão vencidas e ainda não foram totalmente pagas:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 4px 8px; border-bottom: 2px solid #cbd5e1;">Fatura</th>
            <th style="text-align: left; padding: 4px 8px; border-bottom: 2px solid #cbd5e1;">Cliente</th>
            <th style="text-align: left; padding: 4px 8px; border-bottom: 2px solid #cbd5e1;">Total</th>
            <th style="text-align: left; padding: 4px 8px; border-bottom: 2px solid #cbd5e1;">Vencimento</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `),
  });
}

/** Runs the daily overdue-invoices sweep: FACT issued, past dueDate, not fully paid. */
export async function runOverdueInvoicesCheck() {
  const now = new Date();
  const candidates = await prisma.document.findMany({
    where: { type: "FACT", status: "issued", dueDate: { lt: now } },
    include: { client: { select: { name: true } }, paymentLinks: { select: { amount: true } } },
  });

  const overdue = candidates
    .map((doc) => ({
      id: doc.id,
      code: doc.code,
      total: doc.total,
      clientName: doc.client.name,
      dueDate: doc.dueDate,
      paidAmount: doc.paymentLinks.reduce((sum, link) => sum + Number(link.amount), 0),
    }))
    .filter((doc) => doc.paidAmount < Number(doc.total) - 0.01);

  await notifyOverdueInvoices(overdue);
}
