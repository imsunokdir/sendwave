import crypto from "crypto";
import dotnenv from "dotenv";

dotnenv.config();

const ALGO = "aes-256-cbc";
const KEY = crypto
  .createHash("sha256")
  .update(String(process.env.ENCRYPTION_KEY))
  .digest("base64")
  .substr(0, 32); // Must be 32 bytes
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
