// models/campaignContext.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICampaignContext extends Document {
  campaignId: Types.ObjectId;
  text: string;
  pineconeId: string;
  createdAt: Date;
}

const CampaignContextSchema = new Schema<ICampaignContext>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    pineconeId: { type: String, required: true },
  },
  { timestamps: true },
);

export const CampaignContext = mongoose.model<ICampaignContext>(
  "CampaignContext",
  CampaignContextSchema,
);
