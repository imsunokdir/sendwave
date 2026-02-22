import { ImapFlow } from "imapflow";
import { decrypt } from "../utility/encryptionUtility";
import { EmailAccount } from "../models/emailAccounts.model";
import pino from "pino";
import { providerFolderMap } from "../utility/emailFolder";
import { indexEmail } from "./indexEmailsAlgolia";
import { simpleParser } from "mailparser";
import { categorizeEmail } from "../ai/hgnFaceCategorization";
import { client } from "../config/algoliaClient";
import { sendInterestedNotifications } from "./notify";
import { createImapClient } from "../utility/imapConnect";
import { checkAndMarkReply } from "./replyDetection";

const logger = pino({ level: "error" });

export const fetchEmailsAndIndex = async (
  account: any,
  folder: string,
  mode: "historical" | "incremental" = "incremental",
  days?: number,
) => {
  const provider = account.provider.toLowerCase();
  const imapFolder =
    providerFolderMap[provider]?.[folder.toUpperCase()] || folder;

  const imapClient = createImapClient(account);

  await imapClient.connect();
  await imapClient.mailboxOpen(imapFolder);

  const lastUID = account.lastSyncedUID?.get(folder) || 0;

  // First time incremental sync — just bookmark current position
  if (lastUID === 0 && mode === "incremental") {
    const status = await imapClient.status(imapFolder, { uidNext: true });
    const currentLatestUID = (status.uidNext ?? 1) - 1;

    account.lastSyncedUID = account.lastSyncedUID || new Map();
    account.lastSyncedUID.set(folder, currentLatestUID);

    await EmailAccount.findByIdAndUpdate(account._id, {
      lastSyncedUID: account.lastSyncedUID,
    });

    console.log(
      `First incremental sync for ${folder}, setting lastUID to ${currentLatestUID}`,
    );
    await imapClient.logout();
    return 0;
  }

  const fetchQuery =
    mode === "historical"
      ? { since: new Date(Date.now() - Math.ceil(days ?? 30) * 86400 * 1000) }
      : { uid: `${lastUID + 1}:*` };

  const sinceTimestamp = Date.now() - (days ?? 30) * 86400 * 1000;

  let processed = 0;
  for await (const msg of imapClient.fetch(fetchQuery, {
    envelope: true,
    source: true,
    flags: true,
    uid: true,
  })) {
    if (!msg.source) continue;

    // incremental — skip already seen UIDs
    if (mode === "incremental" && msg.uid <= lastUID) continue;

    // historical — exact time precision filter
    if (mode === "historical" && msg.envelope?.date) {
      if (new Date(msg.envelope.date).getTime() < sinceTimestamp) continue;
    }

    // historical — skip already indexed and categorized emails
    if (mode === "historical") {
      const objectID = `${account._id}-${folder}-${msg.uid}`;
      try {
        const existingRecord = await client.getObject({
          indexName: "emails",
          objectID,
        });
        if (
          existingRecord &&
          existingRecord.category !== "Uncategorized" &&
          existingRecord.category !== null
        ) {
          console.log(
            `Skipping ${objectID} — already categorized as ${existingRecord.category}`,
          );
          continue;
        }
      } catch {
        // doesn't exist yet — proceed
      }
    }

    const parsed = await simpleParser(msg.source);

    // ── Reply detection ────────────────────────────────────────────────────────
    if (folder === "INBOX") {
      const fromEmail = parsed.from?.value?.[0]?.address;
      if (fromEmail) await checkAndMarkReply(fromEmail);
    }
    // ──────────────────────────────────────────────────────────────────────────

    await indexEmail(
      account._id.toString(),
      msg,
      parsed,
      folder,
      account.email,
      account.user,
    );

    const emailText = `Subject: ${parsed.subject}\nFrom: ${parsed.from?.text}\n\n${parsed.text}`;
    const category = await categorizeEmail(emailText);

    if (category) {
      await client.partialUpdateObject({
        indexName: "emails",
        objectID: `${account._id}-${folder}-${msg.uid}`,
        attributesToUpdate: { category },
        createIfNotExists: false,
      });
    }

    if (category === "Interested" && account.notificationsEnabled) {
      await sendInterestedNotifications({
        from: parsed.from?.text,
        subject: parsed.subject,
        snippet: parsed.text?.slice(0, 100),
        account: account.email,
      });
    }

    account.lastSyncedUID.set(folder, msg.uid);
    await EmailAccount.findByIdAndUpdate(account._id, {
      lastSyncedUID: account.lastSyncedUID,
      progress: processed,
    });

    processed++;
  }

  await imapClient.logout();
  return processed;
};
