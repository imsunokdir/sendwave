import type { EmailType } from "../types/emailType";

export const mockEmails: EmailType[] = [
  {
    id: "tangitnokdir40@gmail.com-52241",
    account: "tangitnokdir40@gmail.com",
    folder: "INBOX",
    subject: "Interview Invitation",
    from: "hr@company.com",
    to: "tangitnokdir40@gmail.com",
    date: "2025-11-15T14:03:45.000Z",
    flags: {},
    category: "Interested",
    text: "Hi, your profile has been shortlisted. Please select a slot for the interview: https://cal.com/example",
    html: "<p>Hi, your profile has been shortlisted. Please select a slot for the interview: <a href='https://cal.com/example'>Book Now</a></p>",
  },
  {
    id: "tangitnokdir40@gmail.com-52242",
    account: "tangitnokdir40@gmail.com",
    folder: "INBOX",
    subject: "Follow-up on your application",
    from: "recruiter@company.com",
    to: "tangitnokdir40@gmail.com",
    date: "2025-11-14T10:20:00.000Z",
    flags: {},
    category: "Not Interested",
    text: "Thank you for applying. We will keep your profile in our database for future openings.",
    html: "<p>Thank you for applying. We will keep your profile in our database for future openings.</p>",
  },
];
