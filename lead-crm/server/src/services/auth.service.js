const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpires,
  });
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), ver: user.refreshTokenVersion || 0 },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpires }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

const REFRESH_COOKIE_NAME = 'refreshToken';

function refreshCookieOptions() {
  const isProd = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    // Production deploys put the frontend and API on different domains (e.g.
    // Vercel + Render), which makes this a cross-site request from the cookie's
    // point of view — only sameSite:'none' (which requires secure:true) is sent
    // on those. Dev keeps 'strict' since frontend/API are same-site via the Vite proxy.
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
};
