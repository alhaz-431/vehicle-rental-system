import { query } from '../../config/database';

interface UpdateUserData {
  name?: string; email?: string; phone?: string; role?: string;
}

export const getAllUsers = async () => {
  const result = await query('SELECT id, name, email, phone, role FROM users ORDER BY id');
  return result.rows;
};

export const updateUser = async (userId: number, data: UpdateUserData, requestingUser: { id: number; role: string }) => {
  const user = await query('SELECT id, name, email, phone, role FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) throw new Error('User not found');

  if (requestingUser.role === 'customer' && requestingUser.id !== userId)
    throw new Error('Forbidden: You can only update your own profile');

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.name !== undefined) { fields.push(`name = $${paramCount++}`); values.push(data.name); }
  if (data.email !== undefined) { fields.push(`email = $${paramCount++}`); values.push(data.email.toLowerCase()); }
  if (data.phone !== undefined) { fields.push(`phone = $${paramCount++}`); values.push(data.phone); }
  if (data.role !== undefined && requestingUser.role === 'admin') { fields.push(`role = $${paramCount++}`); values.push(data.role); }

  if (fields.length === 0) return user.rows[0];

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, phone, role`, values
  );
  return result.rows[0];
};

export const deleteUser = async (userId: number) => {
  const user = await query('SELECT id FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) throw new Error('User not found');

  const activeBookings = await query("SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'", [userId]);
  if (activeBookings.rows.length > 0) throw new Error('Cannot delete user with active bookings');

  await query('DELETE FROM users WHERE id = $1', [userId]);
};