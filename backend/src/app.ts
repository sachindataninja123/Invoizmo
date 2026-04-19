import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { businessRouter } from './modules/business/business.routes.js';
import { clientsRouter } from './modules/clients/clients.routes.js';
import { invoicesRouter } from './modules/invoices/invoices.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { contactRouter } from './modules/contact/contact.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Invoizmo API is running',
    data: {
      health: '/health',
      ready: '/ready',
      apiBase: '/api/v1'
    }
  });
});

app.use(healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/business', businessRouter);
app.use('/api/v1/clients', clientsRouter);
app.use('/api/v1/invoices', invoicesRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/contact', contactRouter);

app.use(notFound);
app.use(errorHandler);
