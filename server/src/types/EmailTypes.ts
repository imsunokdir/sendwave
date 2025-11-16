export interface EmailType {
  id: string;
  account: string;
  folder: string;
  subject: string;
  from: string;
  to?: string;
  date: string;
  text?: string;
  html?: string;
  category?: string;
  flags?: any;
}
