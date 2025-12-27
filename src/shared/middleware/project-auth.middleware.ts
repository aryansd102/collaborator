import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { query } from '../db/postgres';

export function requireProjectRole(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { projectId } = req.params;

    if (!userId || !projectId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await query(
      `
      SELECT role
      FROM project_members
      WHERE project_id = $1 AND user_id = $2
      `,
      [projectId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: 'Not a project member' });
    }

    if (!allowedRoles.includes(result.rows[0].role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}
