import { Router } from 'express';
import { createBookingHandler, getAllBookingsHandler, updateBookingHandler } from './bookings.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.post('/', authenticate, createBookingHandler);
router.get('/', authenticate, getAllBookingsHandler);
router.put('/:bookingId', authenticate, updateBookingHandler);
export default router;