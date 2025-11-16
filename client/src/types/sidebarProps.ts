import type { EmailType } from "./emailType";

export interface SidebarProps {
  emails: EmailType[];
  query: string;
  setQuery: (q: string) => void;
  selectedAccount: string | "all";
  setSelectedAccount: (a: string | "all") => void;
  selectedFolder: string | "all";
  setSelectedFolder: (f: string | "all") => void;
}
