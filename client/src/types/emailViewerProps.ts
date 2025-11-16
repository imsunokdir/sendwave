import type { EmailType } from "./emailType";

export interface EmailViewerProps {
  emails: EmailType[];
  selectedEmailId: string | null;
}
