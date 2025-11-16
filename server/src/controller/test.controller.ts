import { Request, Response } from "express";

export const testMe = async (req: Request, res: Response) => {
  try {
    const data = { name: "imsu" };
    console.log("heyyy");
    res.json(data);
  } catch (error: any) {
    console.error("Error in testMe controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
