import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { query } from '../db/postgres';

export function requireWorkspaceRole(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { workspaceId } = req.params;

    if (!userId || !workspaceId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await query(
      `
      SELECT role
      FROM workspace_members
      WHERE workspace_id = $1 AND user_id = $2
      `,
      [workspaceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    const role = result.rows[0].role;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

export function requireWorkspaceRoleFromProject(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { projectId } = req.params;

    if (!userId || !projectId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 1. Get workspaceId from project
    const projectResult = await query(
      `SELECT workspace_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const workspaceId = projectResult.rows[0].workspace_id;

    // 2. Check workspace role
    const roleResult = await query(
      `
      SELECT role
      FROM workspace_members
      WHERE workspace_id = $1 AND user_id = $2
      `,
      [workspaceId, userId]
    );

    if (roleResult.rowCount === 0) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    if (!allowedRoles.includes(roleResult.rows[0].role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}
