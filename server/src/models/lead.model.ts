import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILead extends Document {
  campaignId: Types.ObjectId;
  email: string;
  status:
    | "pending"
    | "contacted"
    | "replied"
    | "opted-out"
    | "failed"
    | "responded";
  currentStep: number;
  lastContactedAt?: Date;
  repliedAt?: Date;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: [
        "pending",
        "contacted",
        "replied",
        "opted-out",
        "failed",
        "responded",
      ],
      default: "pending",
    },
    currentStep: { type: Number, default: 0 },
    lastContactedAt: { type: Date },
    repliedAt: { type: Date },
  },
  { timestamps: true },
);

// Unique email per campaign
LeadSchema.index({ campaignId: 1, email: 1 }, { unique: true });

// Fast lookups by status
LeadSchema.index({ campaignId: 1, status: 1 });

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
