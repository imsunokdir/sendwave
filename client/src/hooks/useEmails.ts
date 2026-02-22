import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchEmails } from "../services/emailService";
import type { EmailType } from "../types/emailType";

type Params = {
  account: string | "all";
  folder: string | "all";
  page: number;
  limit: number;
  query?: string;
  category?: string;
};

type EmailsResponse = {
  emails: EmailType[];
  total: number;
};

export const useEmails = (params: Params) => {
  return useQuery<EmailsResponse>({
    queryKey: ["emails", params],
    queryFn: () =>
      fetchEmails(
        params.account,
        params.folder,
        params.page,
        params.limit,
        params.query,
        params.category,
      ),
    placeholderData: keepPreviousData,
  });
};
