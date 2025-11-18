import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utility/jwt";

export const authRequired = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token" });

    const token = header.split(" ")[1];

    const user = verifyAccessToken(token);
    (req as any).user = user;

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
