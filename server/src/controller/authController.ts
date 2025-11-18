import { Request, Response } from "express";
import {
  loginService,
  refreshService,
  registerService,
} from "../services/authService";
import { User } from "../models/User.model";
// import { registerService, loginService, refreshService } from "../services/auth.service";

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
    res.json({ success: true, ...data });
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
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
