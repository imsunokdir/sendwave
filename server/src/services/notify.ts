import axios from "axios";
import dotnenv from "dotenv";

dotnenv.config();

export const sendInterestedNotifications = async (meta: any) => {
  const slackUrl = process.env.SLACK_WEBHOOK_URL!;
  const interestedWebhook = process.env.INTERESTED_WEBHOOK_URL!;

  const slackPayload = {
    text: `📨 *New Interested Lead*\nFrom: ${meta.from}\nSubject: ${meta.subject}\nAccount: ${meta.account}`,
  };

  const webhookPayload = {
    status: "Interested",
    from: meta.from,
    subject: meta.subject,
    snippet: meta.snippet,
  };

  try {
    // Slack
    await axios.post(slackUrl, slackPayload);

    // Webhook.site
    console.log("Webhook URL:", process.env.INTERESTED_WEBHOOK_URL);
    await axios.post(interestedWebhook, webhookPayload);

    console.log("🚀 Notifications sent for Interested email");
  } catch (err: any) {
    console.error("❌ Notification error:", err.message);
  }
};
