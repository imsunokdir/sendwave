import { oauth2Client } from "../config/googleOAuth";
import { EmailAccount } from "../models/emailAccounts.model";

export const getValidAccessToken = async (
  accountId: string,
): Promise<string> => {
  const account = await EmailAccount.findById(accountId);
  if (!account) throw new Error("Account not found");

  // Check if token is expired or expires in next 5 minutes
  const isExpired =
    new Date() >= new Date(account.tokenExpiry.getTime() - 5 * 60 * 1000);

  if (!isExpired) return account.accessToken;

  // Refresh the token
  console.log(`🔄 Refreshing token for ${account.email}`);
  oauth2Client.setCredentials({ refresh_token: account.refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();

  // Update in DB
  await EmailAccount.findByIdAndUpdate(accountId, {
    accessToken: credentials.access_token,
    tokenExpiry: new Date(credentials.expiry_date!),
  });

  return credentials.access_token!;
};
