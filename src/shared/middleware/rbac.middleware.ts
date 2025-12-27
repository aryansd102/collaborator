import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        message: `Forbidden. Required role: ${role}`
      });
    }

    next();
  };
}

export function requireAnyRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Allowed roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}
