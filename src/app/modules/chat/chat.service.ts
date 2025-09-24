import { IChat } from './chat.interface';
import { ChatModel } from './chat.model';
import { Types } from 'mongoose';
import { AES } from '../../../util/crypto.util';
const aes = new AES();
const key = 'secretkey123456';
const saveMessage = async (
  senderId: Types.ObjectId,
  receiverId: Types.ObjectId,
  message: string
): Promise<IChat> => {
  const encrypted = aes.encrypt(message, key);
  const chat = new ChatModel({ senderId, receiverId, encrypted });
  return await chat.save();
};

const getConversation = async (
  userA: Types.ObjectId,
  userB: Types.ObjectId
): Promise<IChat[]> => {
  return await ChatModel.find({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  }).sort({ timestamp: 1 });
};

export const chatService = { saveMessage, getConversation };
