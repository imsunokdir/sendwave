import { api } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CampaignStep {
  order: number;
  delayDays: number;
  subject: string;
  body: string;
}

// export interface Lead {
//   email: string;
//   status: "pending" | "contacted" | "replied" | "opted-out" | "failed";
//   currentStep: number;
//   lastContactedAt?: string;
// }

export interface CampaignSchedule {
  timezone: string;
  sendHour: number;
  sendMinute: number;
  sendDays: number[];
}

export interface ICampaignCategory {
  _id?: string;
  name: string;
  stopSequence: boolean;
}

export interface Lead {
  _id: string; // ← add this
  email: string;
  status: string;
  currentStep: number;
  lastContactedAt?: string;
  repliedAt?: string;
}

export interface Campaign {
  _id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  emailAccount: string;
  steps: CampaignStep[];
  leads?: Lead[];
  schedule: CampaignSchedule;
  autoReply: boolean;
  stats: {
    totalLeads: number;
    sent: number;
    replied: number;
    failed: number;
  };
  replyRules: Record<string, boolean>;
  createdAt: string;
  categories: ICampaignCategory[];
}

export interface CreateCampaignPayload {
  name: string;
  emailAccount: string;
  steps: CampaignStep[];
  schedule: CampaignSchedule;
  categories?: ICampaignCategory[];
}

export interface CampaignContextItem {
  _id: string;
  text: string;
  pineconeId: string;
}

// ─── Campaign ─────────────────────────────────────────────────────────────────
export const getCampaignsService = async (): Promise<Campaign[]> => {
  const res = await api.get("/campaigns");
  return res.data;
};

export const getCampaignService = async (id: string): Promise<Campaign> => {
  const res = await api.get(`/campaigns/${id}`);
  console.log("res:", res.data);
  return res.data;
};

export const createCampaignService = async (
  data: CreateCampaignPayload,
): Promise<Campaign> => {
  const res = await api.post("/campaigns", data);
  console.log("res data c:", res);
  return res.data;
};

export const updateCampaignService = async (
  id: string,
  data: Partial<CreateCampaignPayload>,
): Promise<Campaign> => {
  const res = await api.put(`/campaigns/${id}`, data);
  return res.data;
};

export const deleteCampaignService = async (id: string): Promise<void> => {
  await api.delete(`/campaigns/${id}`);
};

export const setCampaignStatusService = async (
  id: string,
  status: Campaign["status"],
): Promise<Campaign> => {
  const res = await api.patch(`/campaigns/${id}/status`, { status });
  console.log("res: for stta:", res);
  return res.data;
};

export const uploadLeadsService = async (
  id: string,
  payload: { raw?: string; csv?: string },
): Promise<{ added: number; skipped: number }> => {
  const res = await api.post(`/campaigns/${id}/leads`, payload);
  return res.data;
};

// ─── Context ──────────────────────────────────────────────────────────────────
export const getCampaignContextService = async (
  id: string,
): Promise<CampaignContextItem[]> => {
  const res = await api.get(`/campaigns/${id}/context`);
  return res.data;
};

export const saveCampaignContextService = async (
  id: string,
  text: string,
): Promise<void> => {
  await api.post(`/campaigns/${id}/context`, { text });
};

export const deleteCampaignContextService = async (
  id: string,
  contextId: string,
): Promise<void> => {
  await api.delete(`/campaigns/${id}/context/${contextId}`);
};

export const getCampaignLeadsService = async (
  id: string,
  page: number = 1,
  limit: number = 50,
  status: string = "all",
) => {
  const res = await api.get(`/campaigns/${id}/leads`, {
    params: { page, limit, status },
  });
  return res.data; // { leads, total, page, totalPages, hasMore }
};

export const updateReplyRulesService = async (
  campaignId: string,
  category: string,
  enabled: boolean,
) => {
  const res = await api.patch(`/campaigns/${campaignId}/reply-rules`, {
    category,
    enabled,
  });
  return res.data;
};

export const triggerAutoReplyService = async (
  campaignId: string,
  category: string,
) => {
  const res = await api.post(
    `/campaigns/${campaignId}/auto-reply?category=${category}`,
  );
  return res.data;
};

export const updateCategoriesService = async (
  campaignId: string,
  categories: ICampaignCategory[],
) => {
  const res = await api.put(`/campaigns/${campaignId}/categories`, {
    categories,
  });
  return res.data;
};

export const triggerCategoryReplyService = async (
  campaignId: string,
  categoryName: string,
) => {
  const res = await api.post(`/campaigns/${campaignId}/categories/trigger`, {
    categoryName,
  });
  return res.data;
};

export const updateCampaignAutoReplyService = async (
  id: string,
  autoReply: boolean,
): Promise<Campaign> => {
  const res = await api.patch(`/campaigns/${id}/auto-reply`, { autoReply });
  return res.data;
};
