import { ImapFlow } from "imapflow";
import { decrypt } from "./encryptionUtility";
import pino from "pino";

const logger = pino({ level: "error" });

export const createImapClient = (account: any) => {
  return new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapTLS,
    auth: {
      user: account.email,
      pass: decrypt(account.passwordEnc),
    },
    logger,
  });
};

export const getLatestUID = async (
  account: any,
  folder: string,
): Promise<number> => {
  const imapClient = createImapClient(account);
  await imapClient.connect();
  await imapClient.mailboxOpen(folder);
  const status = await imapClient.status(folder, { uidNext: true });
  const currentLatestUID = (status.uidNext ?? 1) - 1;
  await imapClient.logout();
  return currentLatestUID;
};
