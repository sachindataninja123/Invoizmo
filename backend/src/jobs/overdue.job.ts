import cron from 'node-cron';
import { InvoiceModel } from '../modules/invoices/invoice.model.js';

export function startOverdueJob(): void {
  cron.schedule('0 1 * * *', async () => {
    await InvoiceModel.updateMany(
      { status: 'sent', dueDate: { $lt: new Date() }, isDeleted: false },
      { $set: { status: 'overdue' } }
    );
  });
}
