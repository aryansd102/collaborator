import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { json } from 'express';
import { query } from './shared/db/postgres';
import authRoutes from './modules/auth/auth.routes';
import protectedAuthRoutes from './modules/auth/auth.protected';
import demoRoutes from './modules/demo/demo.routes';
import workspaceRoutes from './modules/workspaces/workspace.routes';
import projectRoutes from './modules/projects/projects.routes';
import projectMemberRoutes from './modules/project-members/project-members.routes';
import activityRoutes from './modules/activity/activity.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { initDb } from './shared/db/init-db';


dotenv.config();



export async function createApp() {
  await initDb();
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true }));
  app.use(json());
  app.use(morgan('combined'));

  // Basic in-memory rate limiter (swap to Redis store later)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/auth', protectedAuthRoutes);
  app.use('/api/v1/demo', demoRoutes);
  app.use('/api/v1/workspaces', workspaceRoutes);
  app.use('/api/v1/workspaces', projectRoutes);
  app.use('/api/v1/projects', projectMemberRoutes);
  app.use('/api/v1/workspaces', activityRoutes);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


  app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  app.get('/api/v1', (_req, res) => res.json({ message: 'Collaborative Workspace API', version: 'v1' }));

  return app;
}
