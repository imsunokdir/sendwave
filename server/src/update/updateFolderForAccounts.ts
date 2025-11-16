// fixEmailFolders.ts
import { ImapFlow } from "imapflow";
import type { ImapTypes } from "../types/imapTypes";
import { elasticClient } from "../services/elasticSearch";
import { readLastUIDs, saveLastUIDs } from "../utility/uidsHelper";

// Folders to fix
const FOLDERS = ["INBOX", "Sent", "Spam"];

export const fixFoldersForAccount = async (account: ImapTypes) => {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: { user: account.user, pass: account.password },
    logger: false,
  });

  console.log(`Connecting to IMAP: ${account.user}`);
  await client.connect();
  console.log(`✅ Connected: ${account.user}`);

  const lastUIDs = readLastUIDs();
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (const folder of FOLDERS) {
    const lock = await client.getMailboxLock(folder);
    try {
      console.log(
        `Fetching headers for ${account.user} | ${folder} (last 30 days)...`
      );

      // Fetch only UID and envelope (no body, no categorization)
      const fetchOptions = { uid: true, envelope: true };

      let emailCount = 0;
      for await (const msg of client.fetch(
        { since: THIRTY_DAYS_AGO },
        fetchOptions
      )) {
        const uid = msg.uid;
        if (!uid) continue;

        emailCount++;

        // Update folder in Elasticsearch
        try {
          await elasticClient.updateByQuery({
            index: "emails",
            query: {
              bool: {
                must: [
                  { term: { account: account.user } },
                  { term: { uid: uid } },
                ],
              },
            },
            script: {
              source: "ctx._source.folder = params.folder",
              params: { folder },
            },
            conflicts: "proceed",
          });
        } catch (err: any) {
          console.error(
            `❌ Failed to update folder for UID ${uid}:`,
            err.message
          );
        }

        // Save lastUID for this folder every 50 emails to avoid losing progress
        if (emailCount % 50 === 0) {
          lastUIDs[`${account.user}-${folder}`] = uid;
          saveLastUIDs(lastUIDs);
          console.log(
            `💾 Progress saved: ${emailCount} emails updated for ${folder}`
          );
        }
      }

      // Final save after folder done
      if (emailCount > 0) {
        lastUIDs[`${account.user}-${folder}`] =
          lastUIDs[`${account.user}-${folder}`] || 0;
        saveLastUIDs(lastUIDs);
      }

      console.log(
        `✅ Folder update complete for ${account.user} | ${folder} (${emailCount} emails)`
      );
    } finally {
      lock.release();
    }
  }

  await client.logout();
  console.log(`✅ Finished fixing folders for ${account.user}`);
};

// Example usage:
// const account: ImapTypes = {
//   host: "imap.gmail.com",
//   port: 993,
//   secure: true,
//   user: "tangitnokdir40@gmail.com",
//   password: "yourpassword",
// };
// fixFoldersForAccount(account);
