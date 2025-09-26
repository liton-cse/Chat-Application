import { IChat } from './chat.interface';
import mongoose, { Schema, model } from 'mongoose';
const chatSchema = new Schema<IChat>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    key: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const ChatModel = mongoose.model<IChat>('Chat', chatSchema);
