import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

export const productsRouter = Router();

productsRouter.use(requireAuth);

productsRouter.get("/", asyncHandler(controller.list));
productsRouter.get("/:id", asyncHandler(controller.get));
productsRouter.post("/", requireRole("admin"), asyncHandler(controller.create));
productsRouter.patch("/:id", requireRole("admin"), asyncHandler(controller.update));
productsRouter.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
productsRouter.post("/:id/adjust-stock", requireRole("admin"), asyncHandler(controller.adjustStock));
