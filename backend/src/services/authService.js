import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { sendTemplatedEmail } from './mailerService.js';

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  approved: user.approved,
  profile: user.profile || {},
});

export const registerUser = async ({ name, email, password, role }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error('Email already registered');
    err.status = 400;
    throw err;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'customer',
    approved: true,
  });

  sendTemplatedEmail({
    template: 'welcome',
    to: email,
    data: { name, role: role || 'customer' },
  });

  return sanitizeUser(user);
};

export const loginUser = async ({ email, password }) => {
  console.log(`Attempting login for ${email}`);
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('User not found');
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  console.log(`User found: ${user.email}, Role: ${user.role}, Approved: ${user.approved}`);
  const valid = await user.comparePassword(password);
  console.log(`Password valid: ${valid}`);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);
  return {
    user: sanitizeUser(user),
    tokens: { accessToken, refreshToken },
  };
};

export const refreshTokens = async (token) => {
  const decoded = await verifyRefreshToken(token);
  const payload = { sub: decoded.sub, role: decoded.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);
  return { accessToken, refreshToken };
};

