import { Types } from 'mongoose';

export interface IChat extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  timestamp: Date;
}
