import axios from "axios";
import type { EmailType } from "../types/emailType";
import { api } from "./api";

// export const fetchEmails = async (
//   account?: string,
//   folder?: string,
//   page = 1,
//   limit = 10,
//   query?: string,
//   category?: string
// ) => {
//   const res = await api.get("/emails/all", {
//     params: {
//       account: account !== "all" ? account : undefined,
//       folder: folder !== "all" ? folder : undefined,
//       page,
//       limit,
//       query: query?.trim() ? query : undefined,
//       category: category !== "all" ? category : undefined,
//     },
//   });

//   console.log("res from server:", res.data.results);

//   return res.data.results;
// };

export const fetchEmails = async (
  account?: string,
  folder?: string,
  page = 1,
  limit = 10,
  query?: string,
  category?: string,
) => {
  const res = await api.get("/emails/search", {
    params: {
      account: account !== "all" ? account : undefined,
      folder: folder !== "all" ? folder : undefined,
      page,
      limit,
      query: query?.trim() ? query : undefined,
      category: category !== "all" ? category : undefined,
    },
  });

  return { emails: res.data.emails, total: res.data.total };
};

export const fetchEmailById = async (id: string) => {
  const res = await api.post(`/emails/get-by-id`, { id });
  console.log("res from server (by ID):", res.data);
  return res.data.email.email as EmailType; // match the backend response structure
};

export const fetchSuggestedReplies = async (
  emailId: string,
  signal?: AbortSignal,
): Promise<string[]> => {
  try {
    const res = await api.post(
      `/emails/suggested-replies`,
      { emailId },
      {
        signal,
      },
    );

    console.log("res replies:", res.data.suggestedReplies);

    return res.data.suggestedReplies || [];
  } catch (error) {
    // Handle cancellation gracefully
    if (axios.isCancel(error) || (error as any).code === "ERR_CANCELED") {
      console.log("⏹ Suggested replies request cancelled");
      return []; // Return empty array instead of throwing
    }
    // Re-throw other errors
    throw error;
  }
};

// export const fetchSearchResults = async (
//   query: string,
//   account?: string,
//   folder?: string,
//   page = 1,
//   limit = 10
// ): Promise<{ results: EmailType[] }> => {
//   try {
//     const res = await api.get("/emails/search", {
//       params: {
//         q: query?.trim() ? query : undefined,
//         account: account !== "all" ? account : undefined,
//         folder: folder !== "all" ? folder : undefined,
//         page,
//         limit,
//       },
//     });

//     console.log("Search results from server:", res.data);

//     return res.data;
//   } catch (error) {
//     console.error("Failed to fetch search results:", error);
//     return { results: [] }; // fallback empty results
//   }
// };

export const fetchAllEmailAccounts = async () => {
  try {
    const res = await api.get("/emails/get-all-accounts");
    return res.data.accounts || [];
  } catch (error) {
    console.error("Failed to fetch email accounts:", error);
    return [];
  }
};

export const addEmailAccountService = async (data: any) => {
  const res = await api.post("/emails/add", data);
  return res.data;
};

export const deleteEmailAccountService = async (accountId: string) => {
  const res = await api.delete(`/emails/${accountId}`);
  return res.data;
};

export const toggleSyncService = async (accountId: string) => {
  const res = await api.patch(`/emails/${accountId}/toggle-sync`);
  return res.data;
};

export const toggleNotificationsService = async (accountId: string) => {
  const res = await api.patch(`/emails/${accountId}/toggle-notifications`);
  return res.data;
};
