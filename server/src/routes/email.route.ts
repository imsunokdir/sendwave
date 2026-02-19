import express from "express";
import {
  searchEmailsC,
  reCatgorizeEmails,
  getAllEmailsController,
  getEmailByIdController,
  getSuggestedRepliesController,
  getUserEmailAccounts,
  getEmailsAlgolia,
  searchEmailAlgolia,
  fetchAndCategorizeEmails,
} from "../controller/email.controller";
import { authMiddleware } from "../middlewares/authMiddlewares";
import { addEmailAccount } from "../controller/emailAccController";
const emailRouter = express.Router();

emailRouter.get("/all", getAllEmailsController);
// emailRouter.get("/search", searchEmailsC);
emailRouter.post("/recategorize", reCatgorizeEmails);
emailRouter.post("/get-by-id", getEmailByIdController);
emailRouter.post("/suggested-replies", getSuggestedRepliesController);
emailRouter.get("/get-all-accounts", authMiddleware, getUserEmailAccounts);
emailRouter.post("/add", authMiddleware, addEmailAccount);

//algolia routes
// ----------------- Get emails by folder -----------------
emailRouter.get("/:folder", authMiddleware, getEmailsAlgolia);
// ----------------- Search emails -----------------
emailRouter.get("/search/:query", authMiddleware, searchEmailAlgolia);
// ----------------- Batch categorize emails -----------------
emailRouter.post("/categorize/batch", authMiddleware, fetchAndCategorizeEmails);

export default emailRouter;
