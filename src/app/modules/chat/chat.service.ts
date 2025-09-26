import { IChat } from './chat.interface';
import { ChatModel } from './chat.model';
import { Types } from 'mongoose';
import { AES } from '../../../util/crypto.util';
const aes = new AES();
// send the message to the another friend.
const saveMessage = async (
  senderId: Types.ObjectId,
  receiverId: Types.ObjectId,
  message: string
): Promise<IChat> => {
  const encrypted = aes.encrypt(message);
  const chat = new ChatModel({
    senderId,
    receiverId,
    message: encrypted.cipherHex,
    key: encrypted.key,
  });
  return await chat.save();
};

// get conservation of both of them.
const getAllConversations = async () => {
  const conversations = await ChatModel.find();
  const result = conversations.map(chat => {
    return {
      _id: chat._id,
      senderId: chat.senderId,
      receiverId: chat.receiverId,
      message: aes.decrypt({ cipherHex: chat.message, key: chat.key }),
      timestamp: chat.timestamp,
    };
  });

  return result;
};

export const chatService = {
  saveMessage,
  getAllConversations,
};
