import { Router } from 'express';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth.js';
import { InvoiceModel } from '../invoices/invoice.model.js';
import { ok } from '../../common/apiResponse.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get('/stats', async (req: AuthRequest, res) => {
  const [totalInvoices, paidInvoices, overdueCount, recentInvoices] = await Promise.all([
    InvoiceModel.countDocuments({ userId: req.user?.userId, isDeleted: false }),
    InvoiceModel.find({ userId: req.user?.userId, status: 'paid', isDeleted: false }),
    InvoiceModel.countDocuments({ userId: req.user?.userId, status: 'overdue', isDeleted: false }),
    InvoiceModel.find({ userId: req.user?.userId, isDeleted: false }).sort({ createdAt: -1 }).limit(5)
  ]);

  const totalEarned = paidInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  res.json(ok('Dashboard stats', { totalInvoices, totalEarned, overdueCount, recentInvoices }));
});
