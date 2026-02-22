import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utility/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Try cookie first, fallback to Authorization header
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = verifyAccessToken(token) as any;
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
