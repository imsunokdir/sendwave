import { Request, Response } from "express";
import { addEmailAccountService } from "../services/emailAccountService";

// interface AuthRequest extends Request {
//   user?: { id: string; email: string };
// }

export const addEmailAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { provider, email, password, imapHost, imapPort, imapTLS } = req.body;

    const account = await addEmailAccountService({
      userId: req.user.id,
      provider,
      email,
      password,
      imapHost,
      imapPort,
      imapTLS,
    });

    res.status(201).json({ success: true, account });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
