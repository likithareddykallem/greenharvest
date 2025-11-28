import { registerUser, loginUser, refreshTokens } from '../services/authService.js';
import { catchAsync } from '../utils/catchAsync.js';

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await registerUser({ name, email, password, role });
  res.status(201).json({ user });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await loginUser({ email, password });
  setRefreshCookie(res, tokens.refreshToken);
  res.json({ user, accessToken: tokens.accessToken });
});

export const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }
  const { accessToken, refreshToken } = await refreshTokens(token);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
});

