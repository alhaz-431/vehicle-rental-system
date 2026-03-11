import { Router } from 'express';
import { getAllUsersHandler, updateUserHandler, deleteUserHandler } from './users.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';

const router = Router();
router.get('/', authenticate, authorizeAdmin, getAllUsersHandler);
router.put('/:userId', authenticate, updateUserHandler);
router.delete('/:userId', authenticate, authorizeAdmin, deleteUserHandler);
export default router;