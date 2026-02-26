// import { ImapTypes } from "../types/imapTypes";
// import dotenv from "dotenv";
// import { connectToIMAP } from "../imap/imapClient";

// dotenv.config();

// export const startIMAPConnections = async () => {
//   console.log("📧 Starting IMAP connections...");

//   const accounts: ImapTypes[] = [];

//   // Add account 1 if configured
//   if (process.env.USER1 && process.env.APP_PASSWORD1) {
//     accounts.push({
//       host: "imap.gmail.com",
//       port: 993,
//       secure: true,
//       user: process.env.USER1,
//       password: process.env.APP_PASSWORD1,
//     });
//   }

//   // Add account 2 if configured
//   if (process.env.USER2 && process.env.APP_PASSWORD2) {
//     accounts.push({
//       host: "imap.gmail.com",
//       port: 993,
//       secure: true,
//       user: process.env.USER2,
//       password: process.env.APP_PASSWORD2,
//     });
//   }

//   // Check if any accounts are configured
//   if (accounts.length === 0) {
//     console.error("❌ No email accounts configured!");
//     console.error(
//       "   Add USER1, APP_PASSWORD1 (and optionally USER2, APP_PASSWORD2) to your .env file"
//     );
//     return;
//   }

//   console.log(`Found ${accounts.length} account(s) to connect`);

//   // Connect to each account with individual error handling
//   let successCount = 0;
//   let failCount = 0;

//   for (const acc of accounts) {
//     try {
//       console.log(`\n🔌 Connecting to ${acc.user}...`);
//       await connectToIMAP(acc);
//       console.log(`✅ ${acc.user} - Connected and listening for emails`);
//       successCount++;
//     } catch (err: any) {
//       console.error(`❌ Failed to connect ${acc.user}:`);
//       console.error(`   Error: ${err.message}`);
//       console.error(`   This account will be skipped`);
//       failCount++;

//       // Continue with next account instead of stopping
//       continue;
//     }
//   }

//   console.log(`\n✨ IMAP Setup Complete:`);
//   console.log(`✅ Connected: ${successCount}`);
//   if (failCount > 0) {
//     console.log(`   ❌ Failed: ${failCount}`);
//   }
// };
