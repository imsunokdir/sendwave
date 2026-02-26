import { Request, Response } from "express";
import { oauth2Client, GMAIL_SCOPES } from "../config/googleOAuth";
import { EmailAccount } from "../models/emailAccounts.model";
import { google } from "googleapis";

export const googleConnect = (req: Request, res: Response) => {
  // Store userId in state so we can retrieve it in callback
  const state = Buffer.from(JSON.stringify({ userId: req.user!.id })).toString(
    "base64",
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GMAIL_SCOPES,
    state,
    prompt: "consent", // ← forces refresh token to be returned every time
  });

  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const { userId } = JSON.parse(
      Buffer.from(state as string, "base64").toString(),
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user email from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const email = data.email!;

    // Check if account already exists
    const existing = await EmailAccount.findOne({ user: userId, email });
    if (existing) {
      // Update tokens
      await EmailAccount.findByIdAndUpdate(existing._id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? existing.refreshToken,
        tokenExpiry: new Date(tokens.expiry_date!),
      });
    } else {
      // Create new account
      await EmailAccount.create({
        user: userId,
        provider: "gmail",
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date!),
        imapHost: "imap.gmail.com",
        imapPort: 993,
        imapTLS: true,
      });
    }

    // Redirect to frontend hub
    res.redirect(`${process.env.FRONTEND_URL}/hub?tab=accounts&connected=true`);
  } catch (err: any) {
    console.error("OAuth callback error:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/hub?tab=accounts&error=true`);
  }
};
