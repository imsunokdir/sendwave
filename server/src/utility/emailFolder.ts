export const providerFolderMap: Record<string, Record<string, string>> = {
  gmail: {
    INBOX: "INBOX",
    SPAM: "[Gmail]/Spam",
    SENT: "[Gmail]/Sent Mail",
  },
  yahoo: {
    INBOX: "Inbox",
    SPAM: "Bulk",
    SENT: "Sent",
  },
  outlook: {
    INBOX: "Inbox",
    SPAM: "Junk",
    SENT: "Sent Items",
  },
};
