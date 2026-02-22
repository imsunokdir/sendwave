import { api } from "./api";

export const loginService = async (email: string, password: string) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const registerService = async (
  name: string,
  email: string,
  password: string,
) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
};

export const logoutService = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const getMeService = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
