import axios from "axios";
require("dotenv").config();

export const categorizeEmail = async (
  emailText: string,
  labels: string[], // ← now dynamic
  retries = 3,
): Promise<string | null> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli",
        {
          inputs: emailText,
          parameters: { candidate_labels: labels },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      const data = response.data;
      const topLabel = Array.isArray(data) ? data[0].label : data.labels[0];
      console.log(`Top label: ${topLabel}`);
      return topLabel;
    } catch (error: any) {
      const isTimeout =
        error.code === "ECONNABORTED" || error.response?.status === 504;
      console.error(
        `Attempt ${attempt}/${retries} failed:`,
        error.response?.status || error.message,
      );

      if (isTimeout && attempt < retries) {
        const delay = attempt * 3000;
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        return null;
      }
    }
  }
  return null;
};
