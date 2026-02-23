import { ImapFlow } from "imapflow";
import type { ImapTypes } from "../types/imapTypes";
import { indexEmail } from "../services/elasticSearch";
import { readLastUIDs, saveLastUIDs } from "../utility/uidsHelper";

const connectionStatus = new Map<string, boolean>();
const FOLDERS = ["INBOX", "[Gmail]/Sent Mail", "[Gmail]/Spam"];

export const connectToIMAP = async (account: ImapTypes) => {
  let client: ImapFlow | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5000;

  // --- Create connection ---
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
    reconnectAttempts = 0;
    return newClient;
  };

  // --- Handle disconnection ---
  const handleDisconnection = async () => {
    connectionStatus.set(account.user, false);
    console.error(`❌ Connection lost for ${account.user}`);
    while (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(
        `🔄 Reconnecting ${account.user} (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`,
      );
      try {
        await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY));
        client = await createConnection();
        await performInitialSync(client);
        await setupAllFolderListeners(client);
        console.log(`✅ Reconnected successfully: ${account.user}`);
        return;
      } catch (err: any) {
        console.error(
          `❌ Reconnection attempt ${reconnectAttempts} failed:`,
          err.message,
        );
      }
    }
    console.error(
      `🚫 Failed to reconnect ${account.user} after ${MAX_RECONNECT_ATTEMPTS} attempts`,
    );
  };

  // --- Setup listener for a single folder with IDLE ---
  const setupFolderListener = async (client: ImapFlow, folder: string) => {
    const lastUIDs = readLastUIDs();
    let lastUID = lastUIDs[`${account.user}-${folder}`] || 0;

    console.log(`👂 Setting up listener for ${account.user} | ${folder}`);

    // Open mailbox
    const lock = await client.getMailboxLock(folder);

    try {
      console.log(
        `📬 Opened ${folder} for ${account.user}, starting IDLE mode...`,
      );

      // This is the key: listen for 'exists' events
      const existsHandler = async (data: any) => {
        console.log(`📨 NEW EMAIL detected in ${folder} for ${account.user}!`);

        try {
          const fetchLock = await client.getMailboxLock(folder);
          try {
            const fetchOptions = {
              envelope: true,
              uid: true,
              internalDate: true,
              source: true,
              flags: true,
            };

            // Fetch only new emails (UIDs greater than last seen)
            for await (const msg of client.fetch(
              `${lastUID + 1}:*`,
              fetchOptions,
            )) {
              console.log(
                `[${account.user} | ${folder}] Processing new email UID ${msg.uid}:`,
                msg.envelope?.subject,
              );

              // Index the email
              await indexEmail(account.user, msg, folder);

              // Update last UID
              if (msg.uid && msg.uid > lastUID) {
                lastUID = msg.uid;
                const currentUIDs = readLastUIDs();
                currentUIDs[`${account.user}-${folder}`] = lastUID;
                saveLastUIDs(currentUIDs);
              }
            }
          } finally {
            fetchLock.release();
          }
        } catch (err) {
          console.error(`❌ Error fetching new emails in ${folder}:`, err);
        }
      };

      // Register the exists event handler
      client.on("exists", existsHandler);

      // Keep the mailbox open and IDLE
      // ImapFlow automatically handles IDLE when mailbox is open
      console.log(`✅ IDLE mode active for ${folder} (${account.user})`);
    } finally {
      // Don't release the lock - we want to keep the mailbox open for IDLE
      // lock.release(); // DON'T DO THIS - it will close IDLE
    }
  };

  // --- Setup listeners for all folders ---
  const setupAllFolderListeners = async (client: ImapFlow) => {
    client.on("close", () => {
      console.warn(`⚠️ Connection closed for ${account.user}`);
      handleDisconnection();
    });

    client.on("error", (err) => {
      console.error(`❌ IMAP error for ${account.user}:`, err.message);
      if (!connectionStatus.get(account.user)) handleDisconnection();
    });

    // Since ImapFlow can only IDLE one folder at a time per connection,
    // we'll cycle through folders or create multiple connections
    // For now, let's just monitor INBOX primarily
    await setupFolderListener(client, "INBOX");

    // Alternative: Create separate connections for each folder
    // This is better for production:
    // for (const folder of FOLDERS) {
    //   const folderClient = await createConnection();
    //   await setupFolderListener(folderClient, folder);
    // }
  };

  // --- Fetch last 30 days emails for all folders ---
  const performInitialSync = async (client: ImapFlow) => {
    const lastUIDs = readLastUIDs();
    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const folder of FOLDERS) {
      const lock = await client.getMailboxLock(folder);
      try {
        console.log(
          `Fetching emails for ${account.user} | ${folder} (last 30 days)...`,
        );
        const fetchOptions = {
          envelope: true,
          uid: true,
          internalDate: true,
          source: true,
          flags: true,
        };

        let lastUID = lastUIDs[`${account.user}-${folder}`] || 0;
        let emailCount = 0;

        for await (const msg of client.fetch(
          { since: THIRTY_DAYS_AGO },
          fetchOptions,
        )) {
          if (msg.uid && msg.uid <= lastUID) continue;

          emailCount++;
          console.log(
            `[${account.user} | ${folder}] Fetched UID ${msg.uid}:`,
            msg.envelope?.subject,
          );

          // Index
          await indexEmail(account.user, msg, folder);

          if (msg.uid && msg.uid > lastUID) {
            lastUID = msg.uid;
            if (emailCount % 10 === 0) {
              lastUIDs[`${account.user}-${folder}`] = lastUID;
              saveLastUIDs(lastUIDs);
            }
          }
        }

        lastUIDs[`${account.user}-${folder}`] = lastUID;
        saveLastUIDs(lastUIDs);
        console.log(
          `✅ Completed ${emailCount} emails for ${account.user} | ${folder}`,
        );
      } finally {
        lock.release();
      }
    }
  };

  // --- Connect and start ---
  try {
    client = await createConnection();
    await performInitialSync(client);
    await setupAllFolderListeners(client);
  } catch (err: any) {
    console.error(`❌ Failed to connect ${account.user}:`, err.message);
    throw err;
  }

  return client;
};
