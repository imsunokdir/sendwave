// import { ImapFlow } from "imapflow";
// import fs from "fs";
// import path from "path";
// import type { ImapTypes } from "../types/imapTypes";
// import { indexEmail } from "../services/elasticSearch";
// import { readLastUIDs, saveLastUIDs } from "../utility/uidsHelper";

// export const connectToIMAP = async (account: ImapTypes) => {
//   const client = new ImapFlow({
//     host: account.host,
//     port: account.port,
//     secure: account.secure,
//     auth: { user: account.user, pass: account.password },
//     logger: false,
//   });

//   console.log("Connecting to IMAP", account.user);
//   await client.connect();
//   console.log("Connected:", account.user);

//   const lastUIDs = readLastUIDs();
//   let lastUID = lastUIDs[account.user] || 0;

//   const fetchOptions: any = {
//     envelope: true,
//     uid: true,
//     internalDate: true,
//     source: true,
//     flags: true,
//   };

//   const lock = await client.getMailboxLock("INBOX");
//   try {
//     console.log(
//       `Fetching emails for ${account.user} ${
//         lastUID ? `after UID ${lastUID}` : "for last 30 days"
//       }...`
//     );

//     // Fetch messages
//     const query: any = lastUID
//       ? { uid: `${lastUID + 1}:*` }
//       : { since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };

//     for await (const msg of client.fetch(query, fetchOptions)) {
//       if (msg.uid && msg.uid <= lastUID) {
//         console.log(
//           `[${account.user}] Skipping already indexed UID ${msg.uid}`
//         );
//         continue;
//       }
//       console.log(
//         `[${account.user}] Fetched UID ${msg.uid}:`,
//         msg.envelope?.subject || "(No Subject)"
//       );

//       // Index email in Elasticsearch
//       try {
//         await indexEmail(account.user, msg);
//         // Removed duplicate console.log here
//       } catch (err) {
//         console.error("Error indexing email:", err);
//       }

//       // Update lastUID only if UID is higher
//       if (msg.uid && msg.uid > lastUID) lastUID = msg.uid;
//     }

//     // Save lastUIDs after fetching
//     lastUIDs[account.user] = lastUID;
//     saveLastUIDs(lastUIDs);
//   } finally {
//     lock.release();
//   }

//   // Function for real-time listener (IDLE mode)
//   client.on("exists", async () => {
//     try {
//       // Acquire lock before fetching
//       const lock = await client.getMailboxLock("INBOX");
//       try {
//         // Fetch only new messages with UID higher than lastUID
//         const currentLastUID = lastUIDs[account.user] || 0;

//         for await (const msg of client.fetch(
//           { uid: `${currentLastUID + 1}:*` },
//           fetchOptions
//         )) {
//           // Skip if already processed
//           if (msg.uid && msg.uid <= lastUIDs[account.user]) continue;

//           console.log(
//             `[${account.user}] New Email UID ${msg.uid}:`,
//             msg.envelope?.subject || "(No Subject)"
//           );

//           await indexEmail(account.user, msg);

//           // Update lastUID and save
//           if (msg.uid && msg.uid > lastUIDs[account.user]) {
//             lastUIDs[account.user] = msg.uid;
//             saveLastUIDs(lastUIDs);
//           }
//         }
//       } finally {
//         lock.release();
//       }
//     } catch (err) {
//       console.error("Error fetching new email:", err);
//     }
//   });

//   return client;
// };

// *********&****************************************************
// import { ImapFlow } from "imapflow";
// import type { ImapTypes } from "../types/imapTypes";
// import { indexEmail } from "../services/elasticSearch";
// import { readLastUIDs, saveLastUIDs } from "../utility/uidsHelper";

// export const connectToIMAP = async (account: ImapTypes) => {
//   const client = new ImapFlow({
//     host: account.host,
//     port: account.port,
//     secure: account.secure,
//     auth: { user: account.user, pass: account.password },
//     logger: false,
//   });

//   console.log("Connecting to IMAP", account.user);
//   await client.connect();
//   console.log("Connected:", account.user);

//   const lastUIDs = readLastUIDs();
//   let lastUID = lastUIDs[account.user] || 0;

//   const fetchOptions: any = {
//     envelope: true,
//     uid: true,
//     internalDate: true,
//     source: true,
//     flags: true,
//   };

//   const lock = await client.getMailboxLock("INBOX");
//   try {
//     console.log(
//       `Fetching emails for ${account.user} ${
//         lastUID ? `after UID ${lastUID}` : "for last 30 days"
//       }...`
//     );

//     // Fetch messages
//     const query: any = lastUID
//       ? { uid: `${lastUID + 1}:*` }
//       : { since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };

//     let emailCount = 0;
//     for await (const msg of client.fetch(query, fetchOptions)) {
//       if (msg.uid && msg.uid <= lastUID) {
//         console.log(
//           `[${account.user}] Skipping already indexed UID ${msg.uid}`
//         );
//         continue;
//       }

//       emailCount++;
//       console.log(
//         `[${account.user}] Fetched UID ${msg.uid} (${emailCount}):`,
//         msg.envelope?.subject || "(No Subject)"
//       );

//       // Index email in Elasticsearch (with categorization)
//       try {
//         await indexEmail(account.user, msg);
//       } catch (err: any) {
//         console.error(`Error indexing email UID ${msg.uid}:`, err.message);
//       }

//       // Update lastUID only if UID is higher
//       if (msg.uid && msg.uid > lastUID) {
//         lastUID = msg.uid;

//         // Save UIDs every 10 emails to avoid losing progress
//         if (emailCount % 10 === 0) {
//           lastUIDs[account.user] = lastUID;
//           saveLastUIDs(lastUIDs);
//           console.log(`💾 Progress saved: ${emailCount} emails indexed`);
//         }
//       }
//     }

//     // Final save after fetching all emails
//     lastUIDs[account.user] = lastUID;
//     saveLastUIDs(lastUIDs);
//     console.log(
//       `✅ Initial sync complete for ${account.user}: ${emailCount} emails`
//     );
//   } finally {
//     lock.release();
//   }

//   // Function for real-time listener (IDLE mode)
//   client.on("exists", async () => {
//     try {
//       // Acquire lock before fetching
//       const lock = await client.getMailboxLock("INBOX");
//       try {
//         // Fetch only new messages with UID higher than lastUID
//         const currentLastUID = lastUIDs[account.user] || 0;

//         for await (const msg of client.fetch(
//           { uid: `${currentLastUID + 1}:*` },
//           fetchOptions
//         )) {
//           // Skip if already processed
//           if (msg.uid && msg.uid <= lastUIDs[account.user]) continue;

//           console.log(
//             `[${account.user}] New Email UID ${msg.uid}:`,
//             msg.envelope?.subject || "(No Subject)"
//           );

//           await indexEmail(account.user, msg);

//           // Update lastUID and save immediately for new emails
//           if (msg.uid && msg.uid > lastUIDs[account.user]) {
//             lastUIDs[account.user] = msg.uid;
//             saveLastUIDs(lastUIDs);
//           }
//         }
//       } finally {
//         lock.release();
//       }
//     } catch (err) {
//       console.error("Error fetching new email:", err);
//     }
//   });

//   return client;
// };
// ****************************************************

// import { ImapFlow } from "imapflow";
// import type { ImapTypes } from "../types/imapTypes";
// import { indexEmail } from "../services/elasticSearch";
// import { readLastUIDs, saveLastUIDs } from "../utility/uidsHelper";

// const connectionStatus = new Map<string, boolean>();

// //email folders
// const FOLDERS = ["INBOX", "Sent", "Spam"];

// export const connectToIMAP = async (account: ImapTypes) => {
//   let client: ImapFlow | null = null;
//   let reconnectAttempts = 0;
//   const MAX_RECONNECT_ATTEMPTS = 5;
//   const RECONNECT_DELAY = 5000; // 5 seconds

//   const createConnection = async (): Promise<ImapFlow> => {
//     const newClient = new ImapFlow({
//       host: account.host,
//       port: account.port,
//       secure: account.secure,
//       auth: { user: account.user, pass: account.password },
//       logger: false,
//     });

//     console.log(`Connecting to IMAP: ${account.user}`);
//     await newClient.connect();
//     console.log(`✅ Connected: ${account.user}`);

//     connectionStatus.set(account.user, true);
//     reconnectAttempts = 0;

//     return newClient;
//   };

//   const handleDisconnection = async () => {
//     connectionStatus.set(account.user, false);
//     console.error(`❌ Connection lost for ${account.user}`);
//     while (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
//       reconnectAttempts++;
//       console.log(
//         `🔄 Reconnecting ${account.user} (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
//       );

//       try {
//         await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY));
//         client = await createConnection();
//         await setupListeners(client);
//         await performInitialSync(client);
//         console.log(`✅ Reconnected successfully: ${account.user}`);
//         return;
//       } catch (err: any) {
//         console.error(
//           `❌ Reconnection attempt ${reconnectAttempts} failed:`,
//           err.message
//         );
//       }
//     }
//     console.error(
//       `🚫 Failed to reconnect ${account.user} after ${MAX_RECONNECT_ATTEMPTS} attempts`
//     );
//   };

//   const setupListeners = (client: ImapFlow) => {
//     client.on("close", () => {
//       console.warn(`⚠️ Connection closed for ${account.user}`);
//       handleDisconnection();
//     });

//     client.on("error", (err) => {
//       console.error(`❌ IMAP error for ${account.user}:`, err.message);
//       if (!connectionStatus.get(account.user)) handleDisconnection();
//     });

//     // You can optionally add "exists" events per folder here if needed
//   };

//   const performInitialSync = async (client: ImapFlow) => {
//     const lastUIDs = readLastUIDs();

//     for (const folder of FOLDERS) {
//       const lock = await client.getMailboxLock(folder);
//       try {
//         console.log(
//           `Fetching emails for ${account.user} | ${folder} (last 30 days)...`
//         );
//         const fetchOptions = {
//           envelope: true,
//           uid: true,
//           internalDate: true,
//           source: true,
//           flags: true,
//         };
//         const THIRTY_DAYS_AGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

//         let lastUID = lastUIDs[`${account.user}-${folder}`] || 0;
//         let emailCount = 0;

//         for await (const msg of client.fetch(
//           { since: THIRTY_DAYS_AGO },
//           fetchOptions
//         )) {
//           if (msg.uid && msg.uid <= lastUID) continue;

//           emailCount++;
//           console.log(
//             `[${account.user} | ${folder}] Fetched UID ${msg.uid}:`,
//             msg.envelope?.subject || "(No Subject)"
//           );

//           // Index the email if needed
//           await indexEmail(account.user, msg, folder);

//           if (msg.uid && msg.uid > lastUID) {
//             lastUID = msg.uid;
//             if (emailCount % 10 === 0) {
//               lastUIDs[`${account.user}-${folder}`] = lastUID;
//               saveLastUIDs(lastUIDs);
//             }
//           }
//         }

//         // Save final UID for the folder
//         lastUIDs[`${account.user}-${folder}`] = lastUID;
//         saveLastUIDs(lastUIDs);
//         console.log(
//           `✅ Completed ${emailCount} emails for ${account.user} | ${folder}`
//         );
//       } finally {
//         lock.release();
//       }
//     }
//   };

//   try {
//     client = await createConnection();
//     setupListeners(client);
//     await performInitialSync(client);
//   } catch (err: any) {
//     console.error(`❌ Failed to connect ${account.user}:`, err.message);
//     throw err;
//   }

//   return client;
// };

import { ImapFlow } from "imapflow";
import type { ImapTypes } from "../types/imapTypes";
import { indexEmail } from "../services/elasticSearch";
import { readLastUIDs, saveLastUIDs } from "../utility/uidsHelper";

const connectionStatus = new Map<string, boolean>();
const FOLDERS = ["INBOX", "[Gmail]/Sent Mail", "[Gmail]/Spam"];
export const connectToIMAP = async (account: ImapTypes) => {
  let client: ImapFlow | null = null;

  const createConnection = async (): Promise<ImapFlow> => {
    const newClient = new ImapFlow({
      host: account.host,
      port: account.port,
      secure: account.secure,
      auth: { user: account.user, pass: account.password },
      logger: false,
    });

    console.log(`Connecting to IMAP: ${account.user}`);
    await newClient.connect();
    console.log(`✅ Connected: ${account.user}`);

    connectionStatus.set(account.user, true);
    return newClient;
  };

  const setupFolderListener = async (folder: string) => {
    const lastUIDs = readLastUIDs();
    let lastUID = lastUIDs[`${account.user}-${folder}`] || 0;

    // Acquire lock for IDLE
    const lock = await client!.getMailboxLock(folder);
    lock.release(); // release immediately after registering listener

    client!.on("exists", async () => {
      if (!connectionStatus.get(account.user)) return;

      try {
        const lock = await client!.getMailboxLock(folder);
        try {
          const currentLastUID = lastUIDs[`${account.user}-${folder}`] || 0;
          const fetchOptions = { envelope: true, uid: true, source: true };

          for await (const msg of client!.fetch(
            { uid: `${currentLastUID + 1}:*` },
            fetchOptions
          )) {
            if (!msg.uid || msg.uid <= currentLastUID) continue;

            console.log(
              `[${account.user} | ${folder}] New email UID ${msg.uid}`
            );
            await indexEmail(account.user, msg, folder);

            lastUIDs[`${account.user}-${folder}`] = msg.uid;
            saveLastUIDs(lastUIDs);
          }
        } finally {
          lock.release();
        }
      } catch (err: any) {
        console.error(
          `Error fetching new emails for ${account.user} | ${folder}:`,
          err.message
        );
      }
    });
  };

  const performInitialSync = async () => {
    const lastUIDs = readLastUIDs();

    for (const folder of FOLDERS) {
      const lock = await client!.getMailboxLock(folder);
      try {
        const fetchOptions = { envelope: true, uid: true, source: true };
        const THIRTY_DAYS_AGO = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
        const lastUID = lastUIDs[`${account.user}-${folder}`] || 0;
        let emailCount = 0;

        for await (const msg of client!.fetch(
          { since: THIRTY_DAYS_AGO },
          fetchOptions
        )) {
          if (!msg.uid || msg.uid <= lastUID) continue;

          emailCount++;
          console.log(`[${account.user} | ${folder}] Fetched UID ${msg.uid}`);
          await indexEmail(account.user, msg, folder);

          if (msg.uid > (lastUIDs[`${account.user}-${folder}`] || 0)) {
            lastUIDs[`${account.user}-${folder}`] = msg.uid;
            if (emailCount % 10 === 0) saveLastUIDs(lastUIDs);
          }
        }

        lastUIDs[`${account.user}-${folder}`] =
          lastUIDs[`${account.user}-${folder}`] || lastUID;
        saveLastUIDs(lastUIDs);
        console.log(
          `✅ Completed ${emailCount} emails for ${account.user} | ${folder}`
        );

        // Setup real-time listener per folder
        await setupFolderListener(folder);
      } finally {
        lock.release();
      }
    }
  };

  try {
    client = await createConnection();
    await performInitialSync();
  } catch (err: any) {
    console.error(`❌ Failed to connect ${account.user}:`, err.message);
    throw err;
  }

  return client;
};
