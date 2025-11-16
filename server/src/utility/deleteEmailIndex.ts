import { elasticClient } from "../services/elasticSearch";
import path from "path";
import fs from "fs";

export const deleteEmailsIndex = async () => {
  try {
    const exists = await elasticClient.indices.exists({ index: "emails" });
    if (exists) {
      await elasticClient.indices.delete({ index: "emails" });
      console.log("Deleted index: emails");
    } else {
      console.log("Index 'emails' does not exist.");
    }
  } catch (err) {
    console.error("Error deleting index:", err);
  }
};

export const resetEmails = async () => {
  try {
    // Delete the entire index
    const exists = await elasticClient.indices.exists({ index: "emails" });
    if (exists) {
      await elasticClient.indices.delete({ index: "emails" });
      console.log("Deleted 'emails' index");
    }

    // Reset lastUIDs
    const uidsPath = path.join(__dirname, "../utility/uids.json");
    fs.writeFileSync(uidsPath, JSON.stringify({}), "utf-8");
    console.log("Reset lastUIDs.json");

    console.log(
      "Reset complete! You can now restart your server to re-index all emails."
    );
  } catch (err) {
    console.error("Error resetting emails:", err);
  }
};
