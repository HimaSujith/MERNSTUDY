const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshTokenVersion');
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid email or password');

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({ accessToken, user: user.toSafeObject() });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : null;
  if (!token) throw ApiError.unauthorized('Missing refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenVersion');
  if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or inactive');
  if ((user.refreshTokenVersion || 0) !== payload.ver) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  const accessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions());
  res.json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $inc: { refreshTokenVersion: 1 } });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ success: true });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json(user.toSafeObject());
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password +refreshTokenVersion');

  const match = await user.comparePassword(currentPassword);
  if (!match) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();

  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ success: true, message: 'Password changed. Please log in again.' });
});

module.exports = { login, refresh, logout, me, changePassword };
