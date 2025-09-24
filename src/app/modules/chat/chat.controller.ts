import { NextFunction, Request, Response } from 'express';
import { chatService } from './chat.service';
import { Types } from 'mongoose';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { senderId, receiverId, message } = req.body;

      if (!senderId || !receiverId || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

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
        message: savedMessage.message,
        data: savedMessage,
      });
    } catch (error) {
      next(error);
    }
  }
);

const getConversation = catchAsync(async (req: Request, res: Response) => {
  try {
    const { userA, userB } = req.params;

    const messages = await chatService.getConversation(
      new Types.ObjectId(userA),
      new Types.ObjectId(userB)
    );

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export const ChatController = {
  sendMessage,
  getConversation,
};
