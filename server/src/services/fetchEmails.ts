import { ImapFlow } from "imapflow";
import { decrypt } from "../utility/encryptionUtility";
// import { indexEmail } from "./elasticSearch";
import { EmailAccount } from "../models/emailAccounts.model";
import pino from "pino";
import { providerFolderMap } from "../utility/emailFolder";
import { indexEmail } from "./indexEmailsAlgolia";
import { simpleParser } from "mailparser";

const logger = pino({ level: "error" });

export const fetchEmailsAndIndex = async (
  account: any,
  days: number,
  folder: string,
) => {
  const provider = account.provider.toLowerCase();
  const imapFolder =
    providerFolderMap[provider]?.[folder.toUpperCase()] || folder;
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapTLS,
    auth: {
      user: account.email,
      pass: decrypt(account.passwordEnc),
    },
    logger,
  });

  await client.connect();
  await client.mailboxOpen(imapFolder);

  const sinceDate = new Date(Date.now() - days * 86400 * 1000);

  // Get last synced UID for this folder
  const lastUID = account.lastSyncedUID?.get(folder) || 0;

  let processed = 0;
  for await (const msg of client.fetch(
    { since: sinceDate },
    { envelope: true, source: true, flags: true, uid: true },
  )) {
    // Skip already indexed emails
    if (msg.uid <= lastUID) continue;
    if (!msg.source) {
      console.warn(`Skipping UID ${msg.uid} - no source`);
      continue;
    }
    const parsed = await simpleParser(msg.source);
    await indexEmail(
      account._id.toString(),
      msg,
      parsed,
      folder,
      account.email,
      account.user,
    );

    processed++;

    // Update progress and last UID
    account.lastSyncedUID = account.lastSyncedUID || new Map();
    account.lastSyncedUID.set(folder, msg.uid);

    await EmailAccount.findByIdAndUpdate(account._id, {
      lastSyncedUID: account.lastSyncedUID,
      progress: processed,
    });
  }

  await client.logout();
};
