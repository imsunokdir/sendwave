// outreach.controller.ts
import { Request, Response } from "express";
import {
  deleteOutreachContext,
  getAllOutreachContext,
  saveOutreachContext,
} from "../services/pineOutreachContext";
import { generateReplySuggestion } from "../services/pineRagReply";

export const saveContext = async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });
  await saveOutreachContext(text);
  res.status(201).json({ message: "Context saved!" });
};

export const getAllContext = async (req: Request, res: Response) => {
  const contexts = await getAllOutreachContext();
  res.status(200).json(contexts);
};

export const deleteContext = async (req: Request, res: Response) => {
  await deleteOutreachContext(req.params.id);
  res.status(200).json({ message: "Context deleted!" });
};

export const generateReplySuggestionsPine = async (
  req: Request,
  res: Response,
) => {
  const { emailText } = req.body;
  if (!emailText)
    return res.status(400).json({ message: "emailText is required" });

  const reply = await generateReplySuggestion(emailText);
  if (!reply)
    return res.status(500).json({ message: "Could not generate reply" });

  res.status(200).json({ reply });
};
