import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ContactModel } from './contact.model.js';
import { ok } from '../../common/apiResponse.js';

export const contactRouter = Router();
contactRouter.use(rateLimit({ windowMs: 60 * 60 * 1000, limit: 3 }));
contactRouter.post('/', async (req, res) => {
  const data = await ContactModel.create(req.body);
  res.status(201).json(ok('Message received', data));
});
