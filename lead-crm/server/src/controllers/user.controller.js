const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, paginatedResult } = require('../utils/pagination');

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  // Managers may only browse their own team + themselves.
  if (req.user.role === 'manager') {
    filter.$or = [{ reportsTo: req.user.id }, { _id: req.user.id }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(paginatedResult(items.map((u) => u.toSafeObject()), total, page, limit));
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, reportsTo } = req.body;

  if (req.user.role === 'manager' && role && role !== 'agent') {
    throw ApiError.forbidden('Managers can only create agent accounts');
  }

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: req.user.role === 'manager' ? 'agent' : role || 'agent',
    phone,
    reportsTo: reportsTo || (req.user.role === 'manager' ? req.user.id : undefined),
  });

  res.status(201).json(user.toSafeObject());
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (
    req.user.role === 'manager' &&
    user._id.toString() !== req.user.id &&
    (!user.reportsTo || user.reportsTo.toString() !== req.user.id)
  ) {
    throw ApiError.forbidden();
  }

  res.json(user.toSafeObject());
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, role, reportsTo, phone } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (reportsTo !== undefined) user.reportsTo = reportsTo;

  await user.save();
  res.json(user.toSafeObject());
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  res.json(user.toSafeObject());
});

const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    throw ApiError.badRequest('newPassword must be at least 8 characters');
  }
  const user = await User.findById(req.params.id).select('+refreshTokenVersion');
  if (!user) throw ApiError.notFound('User not found');

  user.password = newPassword;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();

  res.json({ success: true });
});

module.exports = { listUsers, createUser, getUser, updateUser, deactivateUser, resetPassword };
