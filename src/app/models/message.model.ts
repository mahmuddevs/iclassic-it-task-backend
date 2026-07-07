import { Schema, model, type Document, type Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Message = model<IMessage>("Message", MessageSchema);
