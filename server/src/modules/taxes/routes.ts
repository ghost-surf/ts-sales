import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

export const taxesRouter = Router();

taxesRouter.use(requireAuth);

taxesRouter.get("/", asyncHandler(controller.list));
taxesRouter.post("/", requireRole("admin"), asyncHandler(controller.create));
taxesRouter.patch("/:id", requireRole("admin"), asyncHandler(controller.update));
taxesRouter.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
