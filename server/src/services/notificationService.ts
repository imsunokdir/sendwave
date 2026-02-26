import { WebClient } from "@slack/web-api";
import dontenv from "dotenv";
import axios from "axios";
dontenv.config();

// Slack client (optional - only if SLACK_TOKEN is provided)
const slackToken = process.env.SLACK_BOT_TOKEN;
const slackChannelId = process.env.SLACK_CHANNEL_ID;
const slackClient = slackToken ? new WebClient(slackToken) : null;

// Webhook URL
const webhookUrl =
  process.env.WEBHOOK_URL || "https://webhook.site/your-unique-url";

interface EmailData {
  account: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  category: string;
  uid: number;
}

/**
 * Send Slack notification for "Interested" emails
 */
export const sendSlackNotification = async (
  emailData: EmailData,
): Promise<void> => {
  if (!slackClient || !slackChannelId) {
    console.log("⏭️ Slack not configured, skipping notification");
    return;
  }

  try {
    const message = {
      channel: slackChannelId,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎯 New Interested Email!",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*From:*\n${emailData.from}`,
            },
            {
              type: "mrkdwn",
              text: `*Account:*\n${emailData.account}`,
            },
            {
              type: "mrkdwn",
              text: `*Subject:*\n${emailData.subject}`,
            },
            {
              type: "mrkdwn",
              text: `*Date:*\n${new Date(emailData.date).toLocaleString()}`,
            },
          ],
        },
        {
          type: "divider",
        },
      ],
    };

    await slackClient.chat.postMessage(message);
    console.log(`✅ Slack notification sent for: ${emailData.subject}`);
  } catch (error: any) {
    console.error(`❌ Slack notification failed: ${error.message}`);
  }
};

/**
 * Trigger webhook for "Interested" emails
 */
export const triggerWebhook = async (emailData: EmailData): Promise<void> => {
  if (!webhookUrl || webhookUrl.includes("your-unique-url")) {
    console.log("⏭️ Webhook URL not configured, skipping webhook");
    return;
  }

  try {
    const payload = {
      event: "email_interested",
      timestamp: new Date().toISOString(),
      data: {
        account: emailData.account,
        subject: emailData.subject,
        from: emailData.from,
        to: emailData.to,
        date: emailData.date,
        category: emailData.category,
        uid: emailData.uid,
      },
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000, // 5 second timeout
    });

    console.log(`✅ Webhook triggered for: ${emailData.subject}`);
    console.log(`   Response: ${response.status} ${response.statusText}`);
  } catch (error: any) {
    console.error(`❌ Webhook trigger failed: ${error.message}`);
  }
};

/**
 * Main notification handler for "Interested" emails
 */
export const notifyInterestedEmail = async (
  emailData: EmailData,
): Promise<void> => {
  if (emailData.category !== "Interested") {
    return; // Only notify for "Interested" emails
  }

  console.log(`📬 Processing "Interested" email notification...`);

  // Send notifications in parallel
  await Promise.allSettled([
    sendSlackNotification(emailData),
    triggerWebhook(emailData),
  ]);
};
