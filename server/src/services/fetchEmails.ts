import { ImapFlow } from "imapflow";
import { decrypt } from "../utility/encryptionUtility";
// import { decrypt } from "../../utility/encryptionUtility";

export const fetchEmailsSinceDays = async (
  account: any,
  days: number,
  folder: string
) => {
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapTLS,
    auth: {
      user: account.email,
      pass: decrypt(account.passwordEnc),
    },
  });

  await client.connect();

  const sinceDate = new Date(Date.now() - days * 86400 * 1000);
  const messages: any[] = [];

  await client.mailboxOpen(folder);

  for await (const msg of client.fetch(
    { since: sinceDate },
    { envelope: true, source: true, flags: true }
  )) {
    messages.push(msg);
  }

  await client.logout();
  return messages;
};
