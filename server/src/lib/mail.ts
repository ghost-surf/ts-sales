import nodemailer from "nodemailer";
import { env } from "./env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.smtpHost) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    });
  }
  return transporter;
}

interface SendMailInput {
  to: string | string[];
  subject: string;
  html: string;
}

/** No-ops (with a console warning) when SMTP isn't configured, so the app never crashes over a missing/broken mail setup. */
export async function sendMail({ to, subject, html }: SendMailInput): Promise<void> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) return;

  const client = getTransporter();
  if (!client) {
    console.warn(`[mail] SMTP não configurado — email "${subject}" não foi enviado para ${recipients.join(", ")}`);
    return;
  }

  try {
    await client.sendMail({ from: env.smtpFrom, to: recipients.join(","), subject, html });
  } catch (error) {
    console.error(`[mail] Falha ao enviar email "${subject}" para ${recipients.join(", ")}:`, error);
  }
}
