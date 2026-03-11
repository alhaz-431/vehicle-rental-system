import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import vehicleRoutes from './modules/vehicles/vehicles.routes';
import userRoutes from './modules/users/users.routes';
import bookingRoutes from './modules/bookings/bookings.routes';
import { autoReturnExpiredBookings } from './modules/bookings/bookings.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Vehicle Rental System API is running' });
});

setInterval(async () => {
  try { await autoReturnExpiredBookings(); } catch (error) { console.error('Auto-return error:', error); }
}, 60 * 60 * 1000);

autoReturnExpiredBookings().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;