export interface EmailType {
  id: string;
  account: string;
  folder: string;
  from: string;
  subject: string;
  snippet?: string;
  date: string;
  to?: string;
  text?: string;
  html?: string;
  flags?: Record<string, any>;
  category?: string;
  aiLabel?:
    | "Interested"
    | "Meeting Booked"
    | "Not Interested"
    | "Spam"
    | "Out of Office";
}
