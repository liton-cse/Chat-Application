import { NextFunction, Request, Response } from 'express';
import { chatService } from './chat.service';
import { Types } from 'mongoose';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { receiverId, message } = req.body;

      if (!receiverId || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const user = req.user;
      const senderId = req.user.id;
      const savedMessage = await chatService.saveMessage(
        Types.ObjectId.createFromHexString(senderId),
        Types.ObjectId.createFromHexString(receiverId),
        message
      );

      // 🔔 Real-time emit (if socket attached)
      if (req.app.get('io')) {
        const io = req.app.get('io');
        io.to(receiverId).emit('newMessage', savedMessage);
      }
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: '🔔Messages are encrypted successfully and save in database !',
        data: savedMessage,
      });
    } catch (error) {
      next(error);
    }
  }
);
// @apiend: api/v1/chat/conversations
// @method: get
const getConversationHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allConversation = await chatService.getAllConversations();
      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'All conversation fetched successfully!',
        data: allConversation,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const ChatController = {
  sendMessage,
  getConversationHistory,
};
