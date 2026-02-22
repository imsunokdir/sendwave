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
import {
  addEmailAccount,
  deleteEmailAccount,
  toggleCronAcc,
  toggleNotification,
} from "../controller/emailAccController";
import cors from "cors";

const emailRouter = express.Router();

emailRouter.get("/all", getAllEmailsController);
emailRouter.post("/recategorize", reCatgorizeEmails);
emailRouter.post("/get-by-id", getEmailByIdController);
emailRouter.post("/suggested-replies", getSuggestedRepliesController);
emailRouter.get("/get-all-accounts", authMiddleware, getUserEmailAccounts);
emailRouter.post("/add", authMiddleware, addEmailAccount);
emailRouter.get("/search", authMiddleware, searchEmailAlgolia);

//PATCH and DELETE
emailRouter.patch(
  "/:accountId/toggle-notifications",
  authMiddleware,
  toggleNotification,
);
emailRouter.patch("/:accountId/toggle-sync", authMiddleware, toggleCronAcc);

emailRouter.delete("/:accountId", authMiddleware, deleteEmailAccount);
emailRouter.post("/categorize/batch", authMiddleware, fetchAndCategorizeEmails);

// /:folder last since it matches anything
emailRouter.get("/:folder", authMiddleware, getEmailsAlgolia);

export default emailRouter;
