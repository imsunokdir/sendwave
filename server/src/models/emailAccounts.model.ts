import { Schema, model, Document, Types } from "mongoose";

export interface IEmailAccount extends Document {
  user: Types.ObjectId;
  provider: string;

  // IMAP Config
  email: string;
  passwordEnc: string;
  imapHost: string;
  imapPort: number;
  imapTLS: boolean;

  // Sync Info
  lastSyncedUID: Map<string, number>;
  lastSyncedDate?: Date;
  initialSyncCompleted: boolean;

  syncStatus: "idle" | "syncing" | "error";

  errorMessage?: string | null;
  progress: number;
}

const emailAccountSchema = new Schema<IEmailAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    provider: { type: String, required: true }, // Gmail, Outlook, Yahoo, Custom IMAP

    email: { type: String, required: true },
    passwordEnc: { type: String, required: true },

    imapHost: { type: String, required: true },
    imapPort: { type: Number, required: true },
    imapTLS: { type: Boolean, required: true },

    lastSyncedUID: {
      type: Map,
      of: Number,
      default: {},
    },
    lastSyncedDate: { type: Date },

    initialSyncCompleted: { type: Boolean, default: false },

    syncStatus: {
      type: String,
      enum: ["idle", "syncing", "error"],
      default: "idle",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const EmailAccount = model<IEmailAccount>(
  "EmailAccount",
  emailAccountSchema
);
