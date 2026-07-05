import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get("/", asyncHandler(controller.list));
categoriesRouter.post("/", requireRole("admin"), asyncHandler(controller.create));
categoriesRouter.patch("/:id", requireRole("admin"), asyncHandler(controller.update));
categoriesRouter.delete("/:id", requireRole("admin"), asyncHandler(controller.remove));
