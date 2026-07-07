import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";

export const creditNotesRouter = Router();

creditNotesRouter.use(requireAuth);

creditNotesRouter.get("/", asyncHandler(controller.list));
creditNotesRouter.get("/:id", asyncHandler(controller.get));
creditNotesRouter.post("/", asyncHandler(controller.create));
