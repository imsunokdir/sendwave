type ImapConfig = {
  imapHost: string;
  imapPort: number;
  imapTLS: boolean;
};

export const PROVIDER_IMAP_CONFIG: Record<string, ImapConfig> = {
  gmail: {
    imapHost: "imap.gmail.com",
    imapPort: 993,
    imapTLS: true,
  },
  outlook: {
    imapHost: "imap-mail.outlook.com",
    imapPort: 993,
    imapTLS: true,
  },
  yahoo: {
    imapHost: "imap.mail.yahoo.com",
    imapPort: 993,
    imapTLS: true,
  },
};
