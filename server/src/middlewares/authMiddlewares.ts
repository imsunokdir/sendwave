import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utility/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Bearer <token>
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = verifyAccessToken(token) as any;
    req.user = { id: decoded.id, email: decoded.email }; // attach user info

    next(); // pass control to the next middleware or route handler
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
