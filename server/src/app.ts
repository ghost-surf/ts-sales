import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/errorHandler";
import { serializeResponse } from "./middleware/serializeResponse";
import { authRouter } from "./modules/auth/routes";
import { clientsRouter } from "./modules/clients/routes";
import { categoriesRouter } from "./modules/categories/routes";
import { productsRouter } from "./modules/products/routes";
import { servicesRouter } from "./modules/services/routes";
import { taxesRouter } from "./modules/taxes/routes";
import { usersRouter } from "./modules/users/routes";
import { documentsRouter } from "./modules/documents/routes";
import { paymentsRouter } from "./modules/payments/routes";
import { reportsRouter } from "./modules/reports/routes";
import { settingsRouter } from "./modules/settings/routes";
import { stockMovementsRouter } from "./modules/stockMovements/routes";
import { creditNotesRouter } from "./modules/creditNotes/routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
// Higher limit than the default 100kb so a base64-encoded company logo fits in the JSON body.
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(serializeResponse);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/taxes", taxesRouter);
app.use("/api/users", usersRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/stock-movements", stockMovementsRouter);
app.use("/api/credit-notes", creditNotesRouter);

app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));

app.use(errorHandler);
