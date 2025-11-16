import fs from "fs";
import path from "path";

const lastUIDFile = path.join(__dirname, "lastUIDs.json");

// Helper function to read lastUIDs
export const readLastUIDs = (): Record<string, number> => {
  if (fs.existsSync(lastUIDFile)) {
    return JSON.parse(fs.readFileSync(lastUIDFile, "utf-8"));
  }
  return {};
};

// Helper to save lastUIDs
export const saveLastUIDs = (uids: Record<string, number>) => {
  fs.writeFileSync(lastUIDFile, JSON.stringify(uids, null, 2));
};
