import axios from "axios";

const slackUrl = process.env.SLACK_WEBHOOK_URL!;
const interestedUrl = process.env.INTERESTED_WEBHOOK_URL!;

export const sendSlackMessage = async (message: string) => {
  try {
    await axios.post(slackUrl, { text: message });
    console.log("Slack message sent!");
  } catch (err) {
    console.error("Slack webhook error:", err);
  }
};

export const sendInterestedWebhook = async (data: any) => {
  try {
    await axios.post(interestedUrl, data);
    console.log("Webhook.site sent!");
  } catch (err) {
    console.error("Webhook.site error:", err);
  }
};
