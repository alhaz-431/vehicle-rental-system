import { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password || !phone) {
      sendError(res, 400, 'Validation error', 'Name, email, password and phone are required');
      return;
    }
    if (password.length < 6) {
      sendError(res, 400, 'Validation error', 'Password must be at least 6 characters');
      return;
    }
    const user = await registerUser({ name, email, password, phone, role });
    sendSuccess(res, 201, 'User registered successfully', user);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already registered') {
      sendError(res, 400, 'Validation error', error.message);
    } else {
      sendError(res, 500, 'Internal server error', (error as Error).message);
    }
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendError(res, 400, 'Validation error', 'Email and password are required');
      return;
    }
    const data = await loginUser({ email, password });
    sendSuccess(res, 200, 'Login successful', data);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid email or password') {
      sendError(res, 401, 'Unauthorized', error.message);
    } else {
      sendError(res, 500, 'Internal server error', (error as Error).message);
    }
  }
};