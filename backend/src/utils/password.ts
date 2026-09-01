import bcrypt from 'bcrypt';
import env from '@config/env.js';

const SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export default { hashPassword, comparePassword };