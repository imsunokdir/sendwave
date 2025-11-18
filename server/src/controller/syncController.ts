import { Request, Response } from "express";
import { EmailAccount } from "../models/emailAccounts.model";
import { startSyncJob } from "../jobs/syncJob";

export const startSync = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { accounts } = req.body;

  if (!accounts || !Array.isArray(accounts)) {
    return res.status(400).json({ message: "Accounts array required" });
  }

  for (const acc of accounts) {
    const account = await EmailAccount.findOne({
      _id: acc.accountId,
      user: userId,
    });

    if (!account) continue;

    startSyncJob(account, acc.days, acc.folders); // DEFAULT INBOX
  }

  return res.json({ message: "Sync started" });
};
