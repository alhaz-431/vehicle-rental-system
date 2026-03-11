import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../config/database';

interface RegisterData {
  name: string; email: string; password: string; phone: string; role?: string;
}
interface LoginData {
  email: string; password: string;
}

export const registerUser = async (data: RegisterData) => {
  const { name, email, password, phone, role = 'customer' } = data;
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existingUser.rows.length > 0) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
    [name, email.toLowerCase(), hashedPassword, phone, role]
  );
  return result.rows[0];
};

export const loginUser = async (data: LoginData) => {
  const { email, password } = data;
  const result = await query(
    'SELECT id, name, email, phone, role, password FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (result.rows.length === 0) throw new Error('Invalid email or password');

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  };
};