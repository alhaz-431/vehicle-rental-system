import { query } from '../../config/database';

interface VehicleData {
  vehicle_name: string; type: string; registration_number: string;
  daily_rent_price: number; availability_status?: string;
}
interface UpdateVehicleData {
  vehicle_name?: string; type?: string; registration_number?: string;
  daily_rent_price?: number; availability_status?: string;
}

export const createVehicle = async (data: VehicleData) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status = 'available' } = data;
  const validTypes = ['car', 'bike', 'van', 'SUV'];
  if (!validTypes.includes(type)) throw new Error(`Vehicle type must be one of: ${validTypes.join(', ')}`);

  const existing = await query('SELECT id FROM vehicles WHERE registration_number = $1', [registration_number]);
  if (existing.rows.length > 0) throw new Error('Registration number already exists');

  const result = await query(
    'INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [vehicle_name, type, registration_number, daily_rent_price, availability_status]
  );
  return result.rows[0];
};

export const getAllVehicles = async () => {
  const result = await query('SELECT * FROM vehicles ORDER BY id');
  return result.rows;
};

export const getVehicleById = async (vehicleId: number) => {
  const result = await query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
  if (result.rows.length === 0) throw new Error('Vehicle not found');
  return result.rows[0];
};

export const updateVehicle = async (vehicleId: number, data: UpdateVehicleData) => {
  const vehicle = await query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
  if (vehicle.rows.length === 0) throw new Error('Vehicle not found');

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.vehicle_name !== undefined) { fields.push(`vehicle_name = $${paramCount++}`); values.push(data.vehicle_name); }
  if (data.type !== undefined) {
    const validTypes = ['car', 'bike', 'van', 'SUV'];
    if (!validTypes.includes(data.type)) throw new Error(`Vehicle type must be one of: ${validTypes.join(', ')}`);
    fields.push(`type = $${paramCount++}`); values.push(data.type);
  }
  if (data.registration_number !== undefined) { fields.push(`registration_number = $${paramCount++}`); values.push(data.registration_number); }
  if (data.daily_rent_price !== undefined) { fields.push(`daily_rent_price = $${paramCount++}`); values.push(data.daily_rent_price); }
  if (data.availability_status !== undefined) { fields.push(`availability_status = $${paramCount++}`); values.push(data.availability_status); }

  if (fields.length === 0) return vehicle.rows[0];

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(vehicleId);

  const result = await query(
    `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`, values
  );
  return result.rows[0];
};

export const deleteVehicle = async (vehicleId: number) => {
  const vehicle = await query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
  if (vehicle.rows.length === 0) throw new Error('Vehicle not found');

  const activeBookings = await query("SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active'", [vehicleId]);
  if (activeBookings.rows.length > 0) throw new Error('Cannot delete vehicle with active bookings');

  await query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
};