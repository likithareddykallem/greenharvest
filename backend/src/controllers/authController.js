// backend/src/controllers/authController.js

const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const response = require('../utils/apiResponse');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return response.created(res, result, 'Registration successful');
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return response.success(res, result, 'Login successful');
});

exports.refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshSession(req.body.refreshToken);
  return response.success(res, result, 'Token refreshed');
});

exports.logout = asyncHandler(async (req, res) => {
  const { jti } = req.user || {};
  await authService.logoutUser(req.user.id, jti);
  return response.success(res, null, 'Logged out');
});

exports.profile = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return response.success(res, user, 'Profile fetched');
});

