import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.get("/", asyncHandler(controller.list));
documentsRouter.get("/:id", asyncHandler(controller.get));
documentsRouter.post("/", asyncHandler(controller.create));
documentsRouter.patch("/:id/status", asyncHandler(controller.updateStatus));
documentsRouter.post("/:id/convert-to-invoice", asyncHandler(controller.convertToInvoice));
