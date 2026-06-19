import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';
import signalementRoutes from './routes/signalements.routes';
import formationRoutes from './routes/formations.routes';
import ugcRoutes from './routes/ugc.routes';
import mappingRoutes from './routes/mapping.routes';
import notificationsRoutes from './routes/notifications.routes';
import publiciteRoutes from './routes/publicite.routes';
import paymentsRoutes from './routes/payments.routes';
import crowdsourcingRoutes from './routes/crowdsourcing.routes';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware for logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

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

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const server = app.listen(port, () => {
  console.log(`🚀 Server ready at: http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});

export { app, prisma };
