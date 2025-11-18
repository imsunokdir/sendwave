import jwt, { Secret } from "jsonwebtoken";
import type { StringValue } from "ms";
import dotenv from "dotenv";
import { Types } from "mongoose";

dotenv.config();

export interface JWTPayload {
  id: Types.ObjectId;
  email: string;
}

const ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (payload: JWTPayload) => {
  const expires = (process.env.JWT_ACCESS_EXPIRES || "15m") as StringValue;

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: expires,
  });
};

export const generateRefreshToken = (payload: JWTPayload) => {
  const expires = (process.env.JWT_REFRESH_EXPIRES || "7d") as StringValue;

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: expires,
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
};
