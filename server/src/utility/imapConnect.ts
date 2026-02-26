import { ImapFlow } from "imapflow";
// import { decrypt } from "./encryptionUtility";
import pino from "pino";
import { getValidAccessToken } from "../services/tokenRefresh";

// const logger = pino({ level: "error" });

export const createImapClient = async (account: any): Promise<ImapFlow> => {
  const accessToken = await getValidAccessToken(account._id.toString());

  return new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapTLS,
    auth: {
      user: account.email,
      accessToken, // ← OAuth token instead of password
    },
    logger: false,
  });
};

export const getLatestUID = async (
  account: any,
  folder: string,
): Promise<number> => {
  const imapClient = await createImapClient(account); // ← add await
  await imapClient.connect();
  await imapClient.mailboxOpen(folder);
  const status = await imapClient.status(folder, { uidNext: true });
  const currentLatestUID = (status.uidNext ?? 1) - 1;
  await imapClient.logout();
  return currentLatestUID;
};
