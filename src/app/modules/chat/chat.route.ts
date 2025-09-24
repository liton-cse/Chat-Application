import express from 'express';
import { ChatController } from './chat.controller';

const router = express.Router();

router.post('/send', ChatController.sendMessage);
router.get('/history/:userA/:userB', ChatController.getConversation);

export const ChatRouter = router;
