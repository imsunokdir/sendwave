import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICampaignStep {
  order: number;
  delayDays: number;
  subject: string;
  body: string;
}

export interface ICampaignCategory {
  name: string;
  context: string; // AI reply instructions for this category
  autoReply: boolean; // auto-send AI reply when this category is detected
  stopSequence: boolean; // stop sending future emails to this lead
}

export interface IReplyRules {
  Interested: boolean;
  "Meeting Booked": boolean;
  "Not Interested": boolean;
  "Out of Office": boolean;
  Spam: boolean;
}

export interface ICampaignSchedule {
  timezone: string;
  sendHour: number;
  sendMinute: number;
  sendDays: number[];
}

export interface ICampaign extends Document {
  user: Types.ObjectId;
  emailAccount: Types.ObjectId;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  steps: ICampaignStep[];
  schedule: ICampaignSchedule;
  categories: ICampaignCategory[];
  stats: {
    totalLeads: number;
    sent: number;
    replied: number;
    failed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignStepSchema = new Schema<ICampaignStep>(
  {
    order: { type: Number, required: true },
    delayDays: { type: Number, default: 0 },
    subject: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false },
);

const CampaignCategorySchema = new Schema<ICampaignCategory>(
  {
    name: { type: String, required: true },
    context: { type: String, default: "" },
    autoReply: { type: Boolean, default: false },
    stopSequence: { type: Boolean, default: false },
  },
  { _id: true },
);

const CampaignSchema = new Schema<ICampaign>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    emailAccount: {
      type: Schema.Types.ObjectId,
      ref: "EmailAccount",
      required: true,
    },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "draft",
    },
    steps: [CampaignStepSchema],
    schedule: {
      timezone: { type: String, default: "UTC" },
      sendHour: { type: Number, default: 9 },
      sendMinute: { type: Number, default: 0 },
      sendDays: [{ type: Number }],
    },
    categories: [CampaignCategorySchema], // ← replaces replyRules
    stats: {
      totalLeads: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      replied: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);
