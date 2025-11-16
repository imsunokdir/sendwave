import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchEmails } from "../services/emailService";
// import type { EmailType } from "../types/emailType";

type Params = {
  account: string | "all";
  folder: string | "all";
  page: number;
  limit: number;
  query?: string;
  category?: string; // ✅ new category param
};

// type EmailsResponse = {
//   results: {
//     emails: EmailType[];
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

export const useEmails = (params: Params) => {
  return useQuery({
    queryKey: ["emails", params],
    queryFn: () =>
      fetchEmails(
        params.account,
        params.folder,
        params.page,
        params.limit,
        params.query,
        params.category // ✅ pass category to fetch function
      ),
    placeholderData: keepPreviousData, // ⭐ smooth transitions
  });
};
