import { env } from "./env";

interface SendMailInput {
  to: string | string[];
  subject: string;
  html: string;
}

/** No-ops (with a console warning) when Resend isn't configured, so the app never crashes over a missing/broken mail setup. */
export async function sendMail({ to, subject, html }: SendMailInput): Promise<void> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (recipients.length === 0) return;

  if (!env.resendApiKey) {
    console.warn(`[mail] RESEND_API_KEY não configurado — email "${subject}" não foi enviado para ${recipients.join(", ")}`);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.mailFrom, to: recipients, subject, html }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend respondeu ${response.status}: ${body}`);
    }
  } catch (error) {
    console.error(`[mail] Falha ao enviar email "${subject}" para ${recipients.join(", ")}:`, error);
  }
}
