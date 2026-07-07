import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

export const settingsRouter = Router();

// Public: the login page shows the company name/logo before the user is authenticated.
settingsRouter.get("/", asyncHandler(controller.get));
settingsRouter.patch("/", requireAuth, requireRole("admin"), asyncHandler(controller.update));
