import { Router } from 'express';
import { authenticate, AuthRequest } from '../../shared/middleware/auth.middleware';
import { requireProjectRole } from '../../shared/middleware/project-auth.middleware';
import { requireWorkspaceRoleFromProject } from '../../shared/middleware/workspace-auth.middleware';
import { query } from '../../shared/db/postgres';
import { logActivity } from '../../shared/utils/activityLogger';

const router = Router();

/**
 * @swagger
 * /api/v1/projects/{projectId}/members:
 *   post:
 *     summary: Add member to project
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: VIEWER
 *     responses:
 *       201:
 *         description: Member added
 */

/**
 * @swagger
 * /api/v1/projects/{projectId}/members:
 *   get:
 *     summary: List project members
 *     tags: [Project Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members
 */



/**
 * ADD MEMBER TO PROJECT
 * Only workspace OWNER / COLLABORATOR
 */
router.post(
  '/:projectId/members',
  authenticate,
  requireWorkspaceRoleFromProject(['OWNER', 'COLLABORATOR']),
  async (req: AuthRequest, res) => {
    const { projectId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role required' });
    }

    if (!['OWNER', 'CONTRIBUTOR', 'VIEWER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userResult = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    await query(
      `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
      `,
      [projectId, userResult.rows[0].id, role]
    );
    await logActivity({
        actorId: req.user!.userId,
        projectId,
        action: 'PROJECT_MEMBER_ADDED',
        metadata: {
          email,
          role
        }
      });
    res.status(201).json({ message: 'User added to project' });
  }
);

/**
 * LIST PROJECT MEMBERS
 */
router.get(
  '/:projectId/members',
  authenticate,
  requireProjectRole(['OWNER', 'CONTRIBUTOR', 'VIEWER']),
  async (req: AuthRequest, res) => {
    const { projectId } = req.params;

    const result = await query(
      `
      SELECT u.email, pm.role, pm.created_at
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = $1
      `,
      [projectId]
    );

    res.json(result.rows);
  }
);

/**
 * UPDATE PROJECT MEMBER ROLE
 * OWNER only
 */
router.patch(
    '/:projectId/members/:userId',
    authenticate,
    requireProjectRole(['OWNER']),
    async (req: AuthRequest, res) => {
      const { projectId, userId } = req.params;
      const { role } = req.body;
  
      if (!['OWNER', 'CONTRIBUTOR', 'VIEWER'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
  
      // Prevent removing last OWNER
      if (role !== 'OWNER') {
        const owners = await query(
          `
          SELECT COUNT(*) 
          FROM project_members
          WHERE project_id = $1 AND role = 'OWNER'
          `,
          [projectId]
        );
  
        if (Number(owners.rows[0].count) === 1) {
          return res
            .status(400)
            .json({ message: 'Project must have at least one OWNER' });
        }
      }
  
      const result = await query(
        `
        UPDATE project_members
        SET role = $1
        WHERE project_id = $2 AND user_id = $3
        RETURNING user_id, role
        `,
        [role, projectId, userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Member not found' });
      }
  
      res.json({ message: 'Role updated', member: result.rows[0] });
    }
  );
  

  /**
 * REMOVE PROJECT MEMBER
 * OWNER only
 */
router.delete(
    '/:projectId/members/:userId',
    authenticate,
    requireProjectRole(['OWNER']),
    async (req: AuthRequest, res) => {
      const { projectId, userId } = req.params;
  
      // Prevent removing last OWNER
      const owners = await query(
        `
        SELECT COUNT(*) 
        FROM project_members
        WHERE project_id = $1 AND role = 'OWNER'
        `,
        [projectId]
      );
  
      const target = await query(
        `
        SELECT role 
        FROM project_members
        WHERE project_id = $1 AND user_id = $2
        `,
        [projectId, userId]
      );
  
      if (target.rowCount === 0) {
        return res.status(404).json({ message: 'Member not found' });
      }
  
      if (target.rows[0].role === 'OWNER' && Number(owners.rows[0].count) === 1) {
        return res
          .status(400)
          .json({ message: 'Project must have at least one OWNER' });
      }
  
      await query(
        `
        DELETE FROM project_members
        WHERE project_id = $1 AND user_id = $2
        `,
        [projectId, userId]
      );

      await logActivity({
        actorId: req.user!.userId,
        projectId,
        action: 'PROJECT_MEMBER_REMOVED',
        metadata: {
          userId
        }
      });

      res.json({ message: 'User removed from project' });
    }
  );
  

export default router;
