import { Request, Response } from "express";
import { addEmailAccountService } from "../services/emailAccountService";
import { EmailAccount } from "../models/emailAccounts.model";
import { getLatestUID } from "../utility/imapConnect";

// interface AuthRequest extends Request {
//   user?: { id: string; email: string };
// }

export const addEmailAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { provider, email, password, imapHost, imapPort, imapTLS } = req.body;

    const account = await addEmailAccountService({
      userId: req.user.id,
      provider,
      email,
      password,
      imapHost,
      imapPort,
      imapTLS,
    });

    res.status(201).json({ success: true, account });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const toggleCronAcc = async (req: Request, res: Response) => {
  const account = await EmailAccount.findById(req.params.accountId);
  if (!account) return res.status(404).json({ message: "Account not found" });

  account.isActive = !account.isActive;

  // Re-bookmark to current latest UID when turning cron back on
  // so cron only listens to new emails from this point
  if (account.isActive) {
    const currentLatestUID = await getLatestUID(account, "INBOX");
    account.lastSyncedUID.set("INBOX", currentLatestUID);
    console.log(`📌 Re-bookmarked INBOX at UID ${currentLatestUID}`);
  }

  await account.save();

  res.status(200).json({
    message: `Account ${account.isActive ? "activated" : "deactivated"}`,
    isActive: account.isActive,
  });
};

export const toggleNotification = async (req: Request, res: Response) => {
  console.log("PATCH toggle-notifications hit");
  const account = await EmailAccount.findById(req.params.accountId);
  if (!account) return res.status(404).json({ message: "Account not found" });

  account.notificationsEnabled = !account.notificationsEnabled;
  await account.save();

  res.status(200).json({
    message: `Notifications ${account.notificationsEnabled ? "enabled" : "disabled"}`,
    notificationsEnabled: account.notificationsEnabled,
  });
};

export const deleteEmailAccount = async (req: Request, res: Response) => {
  try {
    const account = await EmailAccount.findOneAndDelete({
      _id: req.params.accountId,
      user: req.user?.id,
    });
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
