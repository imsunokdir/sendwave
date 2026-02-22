import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddlewares";
import {
  createCampaignController,
  getCampaignsController,
  getCampaignController,
  updateCampaignController,
  deleteCampaignController,
  setCampaignStatusController,
  uploadLeadsController,
} from "../controller/campaign.controller";
import {
  saveCampaignContextController,
  getCampaignContextController,
  deleteCampaignContextController,
} from "../controller/campaignContext.controller";
import {
  autoReplyInterestedController,
  getDraftReplyController,
  sendSingleReplyController,
  bulkMarkLeadsController,
} from "../controller/smartReply.controller";
import { getLeadThreadController } from "../controller/leadThread.controller";

const campaignRouter = Router();

// ── CRUD ──────────────────────────────────────────────────────────────────────
campaignRouter.post("/", authMiddleware, createCampaignController);
campaignRouter.get("/", authMiddleware, getCampaignsController);
campaignRouter.get("/:id", authMiddleware, getCampaignController);
campaignRouter.put("/:id", authMiddleware, updateCampaignController);
campaignRouter.delete("/:id", authMiddleware, deleteCampaignController);

// ── Status ────────────────────────────────────────────────────────────────────
campaignRouter.patch(
  "/:id/status",
  authMiddleware,
  setCampaignStatusController,
);

// ── Leads ─────────────────────────────────────────────────────────────────────
campaignRouter.post("/:id/leads", authMiddleware, uploadLeadsController);

// ── Context ───────────────────────────────────────────────────────────────────
campaignRouter.get(
  "/:id/context",
  authMiddleware,
  getCampaignContextController,
);
campaignRouter.post(
  "/:id/context",
  authMiddleware,
  saveCampaignContextController,
);
campaignRouter.delete(
  "/:id/context/:contextId",
  authMiddleware,
  deleteCampaignContextController,
);

// ── Smart reply ───────────────────────────────────────────────────────────────
campaignRouter.post(
  "/:id/auto-reply",
  authMiddleware,
  autoReplyInterestedController,
);
campaignRouter.get("/:id/draft-reply", authMiddleware, getDraftReplyController);
campaignRouter.post(
  "/:id/send-reply",
  authMiddleware,
  sendSingleReplyController,
);
campaignRouter.post("/:id/bulk-mark", authMiddleware, bulkMarkLeadsController);

// ── Thread ────────────────────────────────────────────────────────────────────
campaignRouter.get("/:id/thread", authMiddleware, getLeadThreadController);

export default campaignRouter;
