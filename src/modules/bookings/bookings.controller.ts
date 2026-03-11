import { Response } from 'express';
import { createBooking, getAllBookings, updateBooking } from './bookings.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const createBookingHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;
    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      sendError(res, 400, 'Validation error', 'customer_id, vehicle_id, rent_start_date and rent_end_date are required');
      return;
    }
    const booking = await createBooking({ customer_id, vehicle_id, rent_start_date, rent_end_date });
    sendSuccess(res, 201, 'Booking created successfully', booking);
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'Vehicle not found' || message === 'Customer not found') { sendError(res, 404, message); }
    else if (['Vehicle is not available for booking', 'rent_end_date must be after rent_start_date', 'Invalid date format'].includes(message)) {
      sendError(res, 400, 'Validation error', message);
    } else { sendError(res, 500, 'Internal server error', message); }
  }
};

export const getAllBookingsHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, role } = req.user!;
    const bookings = await getAllBookings(id, role);
    const message = role === 'admin' ? 'Bookings retrieved successfully' : 'Your bookings retrieved successfully';
    sendSuccess(res, 200, message, bookings);
  } catch (error) { sendError(res, 500, 'Internal server error', (error as Error).message); }
};

export const updateBookingHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    if (isNaN(bookingId)) { sendError(res, 400, 'Validation error', 'Invalid booking ID'); return; }
    const { status } = req.body;
    if (!status) { sendError(res, 400, 'Validation error', 'status is required'); return; }
    const booking = await updateBooking(bookingId, status, req.user!);
    const message = status === 'cancelled' ? 'Booking cancelled successfully' : 'Booking marked as returned. Vehicle is now available';
    sendSuccess(res, 200, message, booking);
  } catch (error) {
    const message = (error as Error).message;
    if (message === 'Booking not found') { sendError(res, 404, message); }
    else if (message.startsWith('Forbidden')) { sendError(res, 403, message); }
    else if (['Only active bookings can be cancelled', 'Cannot cancel booking after start date', 'Only active bookings can be updated', 'Admin can only mark booking as returned or cancelled'].includes(message)) {
      sendError(res, 400, 'Validation error', message);
    } else { sendError(res, 500, 'Internal server error', message); }
  }
};