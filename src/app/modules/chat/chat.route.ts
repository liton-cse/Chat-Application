import express from 'express';
import { ChatController } from './chat.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/send', auth(USER_ROLES.USER), ChatController.sendMessage);
router.get('/conversations', ChatController.getConversationHistory);

export const ChatRouter = router;
