import { Schema, model, Document, Types } from "mongoose";

// ─── Lead ─────────────────────────────────────────────────────────────────────
export interface ILead {
  email: string;
  status: "pending" | "contacted" | "replied" | "opted-out" | "failed";
  currentStep: number;
  lastContactedAt?: Date;
  repliedAt?: Date;
}

const leadSchema = new Schema<ILead>(
  {
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "contacted", "replied", "opted-out", "failed"],
      default: "pending",
    },
    currentStep: { type: Number, default: 0 },
    lastContactedAt: { type: Date },
    repliedAt: { type: Date },
  },
  { _id: false },
);

// ─── Step ─────────────────────────────────────────────────────────────────────
export interface ICampaignStep {
  order: number; // 0, 1, 2...
  delayDays: number; // days after previous step (0 = send immediately)
  subject: string;
  body: string;
}

const campaignStepSchema = new Schema<ICampaignStep>(
  {
    order: { type: Number, required: true },
    delayDays: { type: Number, required: true, default: 0 },
    subject: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false },
);

// ─── Campaign ─────────────────────────────────────────────────────────────────
export interface ICampaign extends Document {
  user: Types.ObjectId;
  emailAccount: Types.ObjectId; // which connected account sends the emails
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  steps: ICampaignStep[];
  leads: ILead[];
  schedule: {
    timezone: string;
    sendHour: number; // 0-23, hour of day to send
    sendMinute: number;
    sendDays: number[]; // 0=Sun, 1=Mon ... 6=Sat
  };
  // Stats (computed from leads for quick access)
  stats: {
    totalLeads: number;
    sent: number;
    replied: number;
    failed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

    steps: { type: [campaignStepSchema], default: [] },
    leads: { type: [leadSchema], default: [] },

    schedule: {
      timezone: { type: String, default: "UTC" },
      sendHour: { type: Number, default: 9, min: 0, max: 23 },
      sendMinute: { type: Number, default: 0, min: 0, max: 59 }, // ← ADD
      sendDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon–Fri
    },

    stats: {
      totalLeads: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      replied: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const Campaign = model<ICampaign>("Campaign", campaignSchema);
