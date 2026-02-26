import { Schema, model, Document, Types } from "mongoose";

export interface IEmailAccount extends Document {
  user: Types.ObjectId;
  provider: string;
  email: string;

  // OAuth fields (replaces passwordEnc)
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;

  // IMAP Config
  imapHost: string;
  imapPort: number;
  imapTLS: boolean;

  // Sync Info
  lastSyncedUID: Map<string, number>;
  lastSyncedDate?: Date;
  initialSyncCompleted: boolean;
  isActive: boolean;
  notificationsEnabled: boolean;
  syncStatus: "idle" | "syncing" | "error";
  errorMessage?: string | null;
  progress: number;
}

const emailAccountSchema = new Schema<IEmailAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, required: true },
    email: { type: String, required: true },

    // OAuth
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    tokenExpiry: { type: Date, required: true },

    // IMAP
    imapHost: { type: String, required: true },
    imapPort: { type: Number, required: true },
    imapTLS: { type: Boolean, required: true },

    lastSyncedUID: { type: Map, of: Number, default: {} },
    lastSyncedDate: { type: Date },
    initialSyncCompleted: { type: Boolean, default: false },
    syncStatus: {
      type: String,
      enum: ["idle", "syncing", "error"],
      default: "idle",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    isActive: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: false },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

export const EmailAccount = model<IEmailAccount>(
  "EmailAccount",
  emailAccountSchema,
);
