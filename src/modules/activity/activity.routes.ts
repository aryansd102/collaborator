import { Router } from 'express';
import { authenticate, AuthRequest } from '../../shared/middleware/auth.middleware';
import { requireWorkspaceRole } from '../../shared/middleware/workspace-auth.middleware';
import { query } from '../../shared/db/postgres';

const router = Router();

/**
 * @swagger
 * /api/v1/workspaces/{workspaceId}/activity:
 *   get:
 *     summary: Get workspace activity logs
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         example: 0
 *     responses:
 *       200:
 *         description: Activity logs
 */



/**
 * GET workspace activity logs
 */
router.get(
  '/:workspaceId/activity',
  authenticate,
  requireWorkspaceRole(['OWNER', 'COLLABORATOR', 'VIEWER']),
  async (req: AuthRequest, res) => {
    try {
      const { workspaceId } = req.params;

      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = Number(req.query.offset) || 0;
      const action = req.query.action as string | undefined;
      const entityType = req.query.entity_type as string | undefined;

      const conditions: string[] = ['al.workspace_id = $1'];
      const values: any[] = [workspaceId];

      if (action) {
        values.push(action);
        conditions.push(`al.action = $${values.length}`);
      }

      if (entityType) {
        values.push(entityType);
        conditions.push(`al.entity_type = $${values.length}`);
      }

      values.push(limit);
      values.push(offset);

      const queryText = `
        SELECT
          al.id,
          al.action,
          al.entity_type,
          al.entity_id,
          al.metadata,
          al.created_at,
          u.email AS actor_email
        FROM activity_logs al
        LEFT JOIN users u ON u.id = al.actor_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY al.created_at DESC
        LIMIT $${values.length - 1}
        OFFSET $${values.length}
      `;

      const result = await query(queryText, values);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
  }
);


export default router;
