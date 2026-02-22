import { Router } from "express";
import {
  saveContext,
  getAllContext,
  deleteContext,
  generateReplySuggestionsPine,
} from "../controller/outreach.controller";
import { authMiddleware } from "../middlewares/authMiddlewares";

const outreachRouter = Router();

outreachRouter.post("/context", authMiddleware, saveContext);
outreachRouter.get("/context", authMiddleware, getAllContext);
outreachRouter.delete("/context/:id", authMiddleware, deleteContext);
outreachRouter.post(
  "/reply-suggestion",
  authMiddleware,
  generateReplySuggestionsPine,
);
// outreachRouter.post(
//   "/reply-suggestion",
//   authMiddleware,
//   generateReplySuggestionsPine,
// );

export default outreachRouter;
