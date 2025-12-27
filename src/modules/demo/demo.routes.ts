import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { requireRole, requireAnyRole } from '../../shared/middleware/rbac.middleware';

const router = Router();

router.get(
  '/owner',
  authenticate,
  requireRole('OWNER'),
  (_req, res) => {
    res.json({ message: 'Hello OWNER 👑' });
  }
);

router.get(
  '/collab',
  authenticate,
  requireAnyRole(['OWNER', 'COLLABORATOR']),
  (_req, res) => {
    res.json({ message: 'Hello COLLABORATOR 🤝' });
  }
);

export default router;
