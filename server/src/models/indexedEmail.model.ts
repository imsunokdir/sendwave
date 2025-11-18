// import { Schema, model, Document, Types } from "mongoose";

// export interface IIndexedEmail extends Document {
//   account: Types.ObjectId;
//   messageId: string;
//   subject: string;
//   from: string;
//   to: string[];
//   date: Date;
//   category: string;
//   elasticId: string; // ES _id
// }

// const indexedEmailSchema = new Schema<IIndexedEmail>(
//   {
//     account: { type: Schema.Types.ObjectId, ref: "EmailAccount", required: true },
//     messageId: { type: String, required: true, index: true },

//     subject: String,
//     from: String,
//     to: [String],
//     date: Date,

//     category: { type: String },

//     elasticId: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// export const IndexedEmail = model<IIndexedEmail>("IndexedEmail", indexedEmailSchema);
