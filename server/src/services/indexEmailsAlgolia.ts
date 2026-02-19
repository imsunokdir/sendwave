import { client } from "../config/algoliaClient";

export const indexEmail = async (
  accountId: string,
  msg: any,
  parsed: any,
  folder: string = "INBOX",
  emailAddress?: string,
  accUser?: string,
) => {
  const objectID = `${accountId}-${folder}-${msg.uid}`;

  const textContent = (parsed.text || "").slice(0, 2000); // limit text, Algolia free plan has limit
  const snippet = textContent.slice(0, 200); // small preview

  await client.saveObject({
    indexName: "emails",
    body: {
      objectID,
      accountId,
      email: emailAddress ?? "",
      folder,
      uid: msg.uid,
      user: accUser,

      subject: msg.envelope?.subject || "(No Subject)",
      from: msg.envelope?.from?.map((f: any) => f.address).join(", ") || "",
      to: msg.envelope?.to?.map((t: any) => t.address).join(", ") || "",

      date: msg.envelope?.date,
      flags: msg.flags || [],

      // ❌ REMOVE full html (too big)
      // html: parsed.html || "",

      // ✅ Keep trimmed searchable text
      text: textContent,
      snippet,

      category: "Uncategorized",
    },
  });

  console.log(
    `📥 Indexed: UID ${msg.uid} | Folder: ${folder} | Account: ${accountId}`,
  );
};
