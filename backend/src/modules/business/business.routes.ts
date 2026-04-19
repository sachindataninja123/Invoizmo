import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth.js';
import { BusinessModel } from './business.model.js';
import { ok } from '../../common/apiResponse.js';

export const businessRouter = Router();
businessRouter.use(requireAuth);

businessRouter.get('/', async (req: AuthRequest, res) => {
  const data = await BusinessModel.find({ userId: req.user?.userId, isDeleted: false });
  res.json(ok('Businesses fetched', data));
});

businessRouter.post('/', async (req: AuthRequest, res) => {
  const data = await BusinessModel.create({ ...req.body, userId: req.user?.userId });
  res.status(201).json(ok('Business created', data));
});

businessRouter.patch('/:id', async (req: AuthRequest, res) => {
  const data = await BusinessModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.userId }, req.body, { new: true });
  res.json(ok('Business updated', data));
});

businessRouter.delete('/:id', async (req: AuthRequest, res) => {
  await BusinessModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.userId }, { isDeleted: true });
  res.json(ok('Business deleted'));
});

businessRouter.post('/:id/logo', async (_req, res) => res.json(ok('Logo upload placeholder')));
