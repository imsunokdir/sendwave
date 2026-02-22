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

    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
