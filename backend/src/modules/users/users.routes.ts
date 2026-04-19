import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth.js';
import { UserModel } from './user.model.js';
import { ok, fail } from '../../common/apiResponse.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get('/me', async (req: AuthRequest, res) => {
  const user = await UserModel.findById(req.user?.userId).select('-password');
  return res.json(ok('User profile', user));
});

usersRouter.patch('/me', async (req: AuthRequest, res) => {
  const user = await UserModel.findByIdAndUpdate(req.user?.userId, req.body, { new: true }).select('-password');
  return res.json(ok('Profile updated', user));
});

usersRouter.patch('/me/email', async (req: AuthRequest, res) => {
  const { newEmail, currentPassword } = req.body;
  const user = await UserModel.findById(req.user?.userId);
  if (!user) return res.status(StatusCodes.NOT_FOUND).json(fail('User not found', 'NOT_FOUND'));

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(StatusCodes.UNAUTHORIZED).json(fail('Invalid password', 'INVALID_CREDENTIALS'));

  user.email = newEmail;
  user.emailVerified = false;
  await user.save();
  return res.json(ok('Email update initiated'));
});

usersRouter.delete('/me', async (req: AuthRequest, res) => {
  await UserModel.findByIdAndUpdate(req.user?.userId, { deletedAt: new Date() });
  return res.json(ok('Account deleted'));
});
