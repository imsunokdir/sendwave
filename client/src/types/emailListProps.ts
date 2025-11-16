import type { EmailType } from "./emailType";

export interface EmailListProps {
  emails: EmailType[];
  query: string;
  selectedAccount: string | "all";
  selectedFolder: string | "all";
  selectedEmailId: string | null;
  setSelectedEmailId: (id: string) => void;
}
