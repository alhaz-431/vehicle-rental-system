import { Response } from 'express';
import { getAllUsers, updateUser, deleteUser } from './users.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getAllUsersHandler = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) { sendError(res, 500, 'Internal server error', (error as Error).message); }
};

export const updateUserHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) { sendError(res, 400, 'Validation error', 'Invalid user ID'); return; }
    const user = await updateUser(userId, req.body, req.user!);
    sendSuccess(res, 200, 'User updated successfully', user);
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'User not found') { sendError(res, 404, message); }
    else if (message.startsWith('Forbidden')) { sendError(res, 403, message); }
    else { sendError(res, 500, 'Internal server error', message); }
  }
};

export const deleteUserHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) { sendError(res, 400, 'Validation error', 'Invalid user ID'); return; }
    await deleteUser(userId);
    sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'User not found') { sendError(res, 404, message); }
    else if (message === 'Cannot delete user with active bookings') { sendError(res, 400, message); }
    else { sendError(res, 500, 'Internal server error', message); }
  }
};