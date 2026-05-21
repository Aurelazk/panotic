import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import signalementRoutes from './routes/signalements.routes';
import formationRoutes from './routes/formations.routes';
import ugcRoutes from './routes/ugc.routes';
import mappingRoutes from './routes/mapping.routes';
import notificationsRoutes from './routes/notifications.routes';
import publiciteRoutes from './routes/publicite.routes';
import paymentsRoutes from './routes/payments.routes';
import crowdsourcingRoutes from './routes/crowdsourcing.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/signalements', signalementRoutes);
app.use('/formations', formationRoutes);
app.use('/ugc', ugcRoutes);
app.use('/mapping', mappingRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/publicite', publiciteRoutes);
app.use('/payments', paymentsRoutes);
app.use('/api/crowdsourcing', crowdsourcingRoutes);

// Middleware for logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.listen(port, () => {
  console.log(`🚀 Server ready at: http://localhost:${port}`);
});

export { app, prisma };
