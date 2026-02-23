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
  stats: {
    totalLeads: number;
    sent: number;
    replied: number;
    failed: number;
  };
  createdAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  emailAccount: string;
  steps: CampaignStep[];
  schedule: CampaignSchedule;
}

export interface CampaignContextItem {
  _id: string;
  text: string;
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
