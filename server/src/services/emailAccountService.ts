import { encrypt } from "../utility/encryptionUtility";
import { EmailAccount, IEmailAccount } from "../models/emailAccounts.model";
import bcrypt from "bcryptjs";

interface AddEmailInput {
  userId: string;
  provider: string;
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  imapTLS: boolean;
}

export const addEmailAccountService = async (
  input: AddEmailInput
): Promise<IEmailAccount> => {
  const { userId, email, password, provider, imapHost, imapPort, imapTLS } =
    input;

  // Check if email already exists for this user
  const existing = await EmailAccount.findOne({ user: userId, email });
  if (existing) throw new Error("Email account already added");

  // Encrypt (reversible)
  const passwordEnc = encrypt(password);

  // Create email account
  const account = await EmailAccount.create({
    user: userId,
    provider,
    email,
    passwordEnc,
    imapHost,
    imapPort,
    imapTLS,
    initialSyncCompleted: false,
    syncStatus: "idle",
  });

  return account;
};
