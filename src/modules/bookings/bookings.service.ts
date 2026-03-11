import { query } from '../../config/database';

interface BookingData {
  customer_id: number; vehicle_id: number; rent_start_date: string; rent_end_date: string;
}

export const createBooking = async (data: BookingData) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = data;

  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error('Invalid date format');
  if (endDate <= startDate) throw new Error('rent_end_date must be after rent_start_date');

  const vehicleResult = await query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
  if (vehicleResult.rows.length === 0) throw new Error('Vehicle not found');
  const vehicle = vehicleResult.rows[0];
  if (vehicle.availability_status !== 'available') throw new Error('Vehicle is not available for booking');

  const customerResult = await query('SELECT id FROM users WHERE id = $1', [customer_id]);
  if (customerResult.rows.length === 0) throw new Error('Customer not found');

  const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const total_price = vehicle.daily_rent_price * numberOfDays;

  const bookingResult = await query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  await query("UPDATE vehicles SET availability_status = 'booked', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [vehicle_id]);

  return {
    ...bookingResult.rows[0],
    vehicle: { vehicle_name: vehicle.vehicle_name, daily_rent_price: vehicle.daily_rent_price },
  };
};

export const getAllBookings = async (userId: number, userRole: string) => {
  if (userRole === 'admin') {
    const result = await query(
      `SELECT b.*, u.name as customer_name, u.email as customer_email, v.vehicle_name, v.registration_number
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN vehicles v ON b.vehicle_id = v.id
       ORDER BY b.id`
    );
    return result.rows.map((row) => ({
      id: row.id, customer_id: row.customer_id, vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date, rent_end_date: row.rent_end_date,
      total_price: row.total_price, status: row.status,
      customer: { name: row.customer_name, email: row.customer_email },
      vehicle: { vehicle_name: row.vehicle_name, registration_number: row.registration_number },
    }));
  } else {
    const result = await query(
      `SELECT b.id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
        v.vehicle_name, v.registration_number, v.type
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.customer_id = $1 ORDER BY b.id`,
      [userId]
    );
    return result.rows.map((row) => ({
      id: row.id, vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date, rent_end_date: row.rent_end_date,
      total_price: row.total_price, status: row.status,
      vehicle: { vehicle_name: row.vehicle_name, registration_number: row.registration_number, type: row.type },
    }));
  }
};

export const updateBooking = async (bookingId: number, status: string, requestingUser: { id: number; role: string }) => {
  const bookingResult = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  if (bookingResult.rows.length === 0) throw new Error('Booking not found');
  const booking = bookingResult.rows[0];

  if (requestingUser.role === 'customer') {
    if (booking.customer_id !== requestingUser.id) throw new Error('Forbidden: You can only update your own bookings');
    if (status !== 'cancelled') throw new Error('Forbidden: Customers can only cancel bookings');
    if (booking.status !== 'active') throw new Error('Only active bookings can be cancelled');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(booking.rent_start_date) <= today) throw new Error('Cannot cancel booking after start date');
  }

  if (requestingUser.role === 'admin') {
    if (status !== 'returned' && status !== 'cancelled') throw new Error('Admin can only mark booking as returned or cancelled');
    if (booking.status !== 'active') throw new Error('Only active bookings can be updated');
  }

  const updatedResult = await query(
    'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, bookingId]
  );

  if (status === 'cancelled' || status === 'returned') {
    await query("UPDATE vehicles SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [booking.vehicle_id]);
  }

  if (status === 'returned') {
    return { ...updatedResult.rows[0], vehicle: { availability_status: 'available' } };
  }
  return updatedResult.rows[0];
};

export const autoReturnExpiredBookings = async () => {
  const today = new Date().toISOString().split('T')[0];
  const expired = await query("SELECT id, vehicle_id FROM bookings WHERE status = 'active' AND rent_end_date < $1", [today]);
  for (const booking of expired.rows) {
    await query("UPDATE bookings SET status = 'returned', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [booking.id]);
    await query("UPDATE vehicles SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [booking.vehicle_id]);
  }
};