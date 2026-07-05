import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

export const servicesRouter = Router();

servicesRouter.use(requireAuth);

servicesRouter.get("/", asyncHandler(controller.list));
servicesRouter.get("/:id", asyncHandler(controller.get));
servicesRouter.post("/", requireRole("admin"), asyncHandler(controller.create));
servicesRouter.patch("/:id", requireRole("admin"), asyncHandler(controller.update));
servicesRouter.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
