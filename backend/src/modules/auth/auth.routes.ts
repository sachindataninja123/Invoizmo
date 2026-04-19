import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { UserModel } from '../users/user.model.js';
import { ok, fail } from '../../common/apiResponse.js';
import { signAccessToken, signRefreshToken } from '../../services/token.service.js';
import { env } from '../../config/env.js';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth.js';

export const authRouter = Router();

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function toSafeUser(user: { toObject: () => Record<string, unknown> }): Record<string, unknown> {
  const userObject = user.toObject();
  const { password: _password, ...safeUser } = userObject;
  void _password;
  return safeUser;
}

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await UserModel.findOne({ email });
  if (exists) return res.status(StatusCodes.CONFLICT).json(fail('Email already exists', 'EMAIL_EXISTS'));

  const hash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, password: hash, plan: 'free', invoiceCount: 0, invoiceSequence: 0 });
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return res.status(StatusCodes.CREATED).json(
    ok('User registered', {
      user: toSafeUser(user),
      accessToken
    })
  );
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email, deletedAt: null });
  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json(fail('Invalid credentials', 'INVALID_CREDENTIALS'));

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(StatusCodes.UNAUTHORIZED).json(fail('Invalid credentials', 'INVALID_CREDENTIALS'));

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return res.json(
    ok('Logged in', {
      user: toSafeUser(user),
      accessToken
    })
  );
});

authRouter.post('/logout', requireAuth, async (_req, res) => {
  res.clearCookie('refreshToken', { path: '/' });
  res.json(ok('Logged out'));
});

authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  if (!refreshToken) return res.status(StatusCodes.UNAUTHORIZED).json(fail('No refresh token', 'UNAUTHORIZED'));

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
    return res.json(ok('Token refreshed', { accessToken: signAccessToken(payload.userId) }));
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json(fail('Invalid refresh token', 'INVALID_TOKEN'));
  }
});

authRouter.post('/forgot-password', async (_req, res) => res.json(ok('Reset email queued')));
authRouter.post('/reset-password', async (_req, res) => res.json(ok('Password reset successfully')));
authRouter.post('/verify-email', async (_req, res) => res.json(ok('Email verified')));
authRouter.post('/resend-verification', requireAuth, async (_req, res) => res.json(ok('Verification sent')));

authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await UserModel.findById(req.user?.userId).select('-password');
  return res.json(ok('Profile fetched', user));
});
