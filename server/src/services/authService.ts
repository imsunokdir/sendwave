import bcrypt from "bcryptjs";
import { User } from "../models/User.model";
import dotenv from "dotenv";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utility/jwt";

dotenv.config();

export const registerService = async (
  name: string,
  email: string,
  password: string
) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, Number(process.env.SALT));

  const user = await User.create({ name, email, password: hashed });
  return user;
};

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const payload = { id: user._id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  // remove sensitive fields before returning
  const { password: pwd, refreshToken: rt, ...userSafe } = user.toObject();

  return { user: userSafe, accessToken, refreshToken };
};

export const refreshService = async (token: string) => {
  const decoded = verifyRefreshToken(token) as any;
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  const payload = { id: user._id, email: user.email };
  return generateAccessToken(payload);
};
