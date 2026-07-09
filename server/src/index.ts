import cron from "node-cron";
import { app } from "./app";
import { env } from "./lib/env";
import { runOverdueInvoicesCheck } from "./modules/notifications/service";

app.listen(env.port, () => {
  console.log(`TS Sales API a correr em http://localhost:${env.port}`);
});

// Digest diário de faturas vencidas, às 08:00.
cron.schedule("0 8 * * *", () => {
  runOverdueInvoicesCheck().catch((error) => console.error("[notifications] falha no digest de faturas vencidas:", error));
});
