import { api } from "./api";

export interface ContextItem {
  _id: string;
  text: string;
  createdAt: string;
}

export const getAllContextService = async (): Promise<ContextItem[]> => {
  const res = await api.get("/outreach/context");
  console.log(res);
  return res.data;
};

export const saveContextService = async (text: string): Promise<void> => {
  await api.post("/outreach/context", { text });
};

export const deleteContextService = async (id: string): Promise<void> => {
  await api.delete(`/outreach/context/${id}`);
};
