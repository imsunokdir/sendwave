import express from "express";
import {
  searchEmailsC,
  reCatgorizeEmails,
  getAllEmailsController,
  getEmailByIdController,
  getSuggestedRepliesController,
} from "../controller/email.controller";
import { authMiddleware } from "../middlewares/authMiddlewares";
import { addEmailAccount } from "../controller/emailAccController";

const emailRouter = express.Router();

emailRouter.get("/all", getAllEmailsController);
// emailRouter.get("/search", searchEmailsC);
emailRouter.post("/recategorize", reCatgorizeEmails);
emailRouter.post("/get-by-id", getEmailByIdController);
emailRouter.post("/suggested-replies", getSuggestedRepliesController);
// emailRouter.get("/get-all-accounts", getAllEmailAccounts);
emailRouter.post("/add", authMiddleware, addEmailAccount);

export default emailRouter;
