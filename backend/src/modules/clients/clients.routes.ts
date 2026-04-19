import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth.js';
import { ClientModel } from './client.model.js';
import { ok } from '../../common/apiResponse.js';

export const clientsRouter = Router();
clientsRouter.use(requireAuth);

clientsRouter.get('/', async (req: AuthRequest, res) => {
  const data = await ClientModel.find({ userId: req.user?.userId, isDeleted: false });
  res.json(ok('Clients fetched', data));
});
clientsRouter.post('/', async (req: AuthRequest, res) => {
  const data = await ClientModel.create({ ...req.body, userId: req.user?.userId });
  res.status(201).json(ok('Client created', data));
});
clientsRouter.get('/:id', async (req: AuthRequest, res) => {
  const data = await ClientModel.findOne({ _id: req.params.id, userId: req.user?.userId, isDeleted: false });
  res.json(ok('Client fetched', data));
});
clientsRouter.patch('/:id', async (req: AuthRequest, res) => {
  const data = await ClientModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.userId }, req.body, { new: true });
  res.json(ok('Client updated', data));
});
clientsRouter.delete('/:id', async (req: AuthRequest, res) => {
  await ClientModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.userId }, { isDeleted: true });
  res.json(ok('Client deleted'));
});
