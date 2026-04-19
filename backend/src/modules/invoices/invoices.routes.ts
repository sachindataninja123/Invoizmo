import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth.js';
import { ok, fail } from '../../common/apiResponse.js';
import { InvoiceModel } from './invoice.model.js';
import { UserModel } from '../users/user.model.js';
import { computeInvoiceTotals, canCreateInvoice } from './invoice.utils.js';

export const invoicesRouter = Router();
invoicesRouter.use(requireAuth);

invoicesRouter.get('/', async (req: AuthRequest, res) => {
  const data = await InvoiceModel.find({ userId: req.user?.userId, isDeleted: false }).sort({ createdAt: -1 });
  res.json(ok('Invoices fetched', data));
});

invoicesRouter.post('/', async (req: AuthRequest, res) => {
  const user = await UserModel.findById(req.user?.userId);
  if (!user) return res.status(StatusCodes.NOT_FOUND).json(fail('User not found', 'NOT_FOUND'));
  if (!canCreateInvoice(user.plan, user.invoiceCount)) {
    return res.status(StatusCodes.FORBIDDEN).json(fail('Free plan invoice limit reached', 'FREE_PLAN_LIMIT_REACHED'));
  }

  user.invoiceSequence += 1;
  user.invoiceCount += 1;
  await user.save();

  const prefix = req.body.invoicePrefix || 'INV';
  const invoiceNumber = `${prefix}-${String(user.invoiceSequence).padStart(4, '0')}`;
  const totals = computeInvoiceTotals(req.body.lineItems || [], req.body.discountType, req.body.discountValue || 0);

  const data = await InvoiceModel.create({
    ...req.body,
    ...totals,
    userId: req.user?.userId,
    invoiceNumber,
    status: 'draft'
  });

  res.status(201).json(ok('Invoice created', data));
});

invoicesRouter.get('/:id', async (req: AuthRequest, res) => {
  const data = await InvoiceModel.findOne({ _id: req.params.id, userId: req.user?.userId, isDeleted: false });
  res.json(ok('Invoice fetched', data));
});

invoicesRouter.patch('/:id', async (req: AuthRequest, res) => {
  const invoice = await InvoiceModel.findOne({ _id: req.params.id, userId: req.user?.userId, isDeleted: false });
  if (!invoice) return res.status(StatusCodes.NOT_FOUND).json(fail('Invoice not found', 'NOT_FOUND'));
  if (invoice.status !== 'draft') return res.status(StatusCodes.FORBIDDEN).json(fail('Invoice not editable', 'INVOICE_NOT_EDITABLE'));

  Object.assign(invoice, req.body);
  await invoice.save();
  res.json(ok('Invoice updated', invoice));
});

invoicesRouter.delete('/:id', async (req: AuthRequest, res) => {
  const invoice = await InvoiceModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.userId }, { isDeleted: true }, { new: true });
  if (invoice?.status === 'draft') await UserModel.findByIdAndUpdate(req.user?.userId, { $inc: { invoiceCount: -1 } });
  res.json(ok('Invoice deleted'));
});

invoicesRouter.get('/:id/pdf', async (_req, res) => res.json(ok('PDF generation placeholder')));
invoicesRouter.post('/:id/send', async (req: AuthRequest, res) => {
  const invoice = await InvoiceModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.userId }, { status: 'sent', sentAt: new Date() }, { new: true });
  res.json(ok('Invoice sent', invoice));
});
invoicesRouter.patch('/:id/mark-paid', async (req: AuthRequest, res) => {
  const invoice = await InvoiceModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.userId }, { status: 'paid', paidAt: new Date() }, { new: true });
  res.json(ok('Invoice marked paid', invoice));
});
invoicesRouter.post('/:id/duplicate', async (req: AuthRequest, res) => {
  const source = await InvoiceModel.findOne({ _id: req.params.id, userId: req.user?.userId });
  const user = await UserModel.findById(req.user?.userId);
  if (!source || !user) return res.status(404).json(fail('Invoice not found', 'NOT_FOUND'));

  user.invoiceSequence += 1;
  user.invoiceCount += 1;
  await user.save();

  const copy = source.toObject() as Record<string, unknown>;
  const { _id: _removedId, ...sanitizedCopy } = copy;
  void _removedId;
  const created = await InvoiceModel.create({
    ...sanitizedCopy,
    status: 'draft',
    sentAt: null,
    paidAt: null,
    invoiceNumber: `INV-${String(user.invoiceSequence).padStart(4, '0')}`
  });
  res.status(201).json(ok('Invoice duplicated', created));
});
