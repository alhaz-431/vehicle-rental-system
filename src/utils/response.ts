import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
) => {
  const response: Record<string, unknown> = { success: true, message };
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
) => {
  const response: Record<string, unknown> = { success: false, message };
  if (errors !== undefined) response.errors = errors;
  return res.status(statusCode).json(response);
};