import { Request, Response } from "express";
import {
  loginService,
  refreshService,
  registerService,
} from "../services/authService";
import { User } from "../models/User.model";
// import { registerService, loginService, refreshService } from "../services/auth.service";
import bcrypt from "bcryptjs";
// import { Campaign } from "src/models/campaign.model";
// import { EmailAccount } from "src/models/emailAccounts.model";
// import { pineconeIndex } from "src/config/pinecone";
// import { client } from "src/config/algoliaClient";
require("dotenv").config();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerService(name, email, password);
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginService(email, password);

    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ success: true, user: data.user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const accessToken = await refreshService(token);
    res.json({ success: true, accessToken });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select(
      "-password -refreshToken",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: { name, email } },
      { new: true },
    ).select("-password -refreshToken");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// export const deleteAccount = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user!.id;

//     // 1. Get all campaigns and email accounts
//     const campaigns = await Campaign.find({ user: userId }).select("_id");
//     const campaignIds = campaigns.map((c) => c._id.toString());
//     const emailAccounts = await EmailAccount.find({ user: userId }).select("_id");
//     const accountIds = emailAccounts.map((a) => a._id.toString());

//     // 2. Pinecone — delete vectors
//     for (const campaignId of campaignIds) {
//       try {
//         await pineconeIndex.deleteMany({ campaignId });
//       } catch (err) {
//         console.error(`Pinecone delete failed for campaign ${campaignId}:`, err);
//       }
//     }

//     // 3. Algolia — delete indexed emails
//     for (const accountId of accountIds) {
//       try {
//         await client.deleteBy({
//           filters: `accountId:${accountId}`,
//         });
//       } catch (err) {
//         console.error(`Algolia delete failed for account ${accountId}:`, err);
//       }
//     }

//     // 4. MongoDB
//     await Lead.deleteMany({ campaignId: { $in: campaignIds } });
//     await CampaignContext.deleteMany({ campaign: { $in: campaignIds } });
//     await Campaign.deleteMany({ user: userId });
//     await EmailAccount.deleteMany({ user: userId });
//     await User.findByIdAndDelete(userId);

//     // 5. Clear cookies
//     res.clearCookie("accessToken");
//     res.clearCookie("refreshToken");

//     res.status(200).json({ success: true, message: "Account deleted" });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };
