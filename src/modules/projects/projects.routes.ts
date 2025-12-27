import { Router } from 'express';
import { authenticate, AuthRequest } from '../../shared/middleware/auth.middleware';
import { requireWorkspaceRole } from '../../shared/middleware/workspace-auth.middleware';
import { query } from '../../shared/db/postgres';
import { requireProjectRole } from '../../shared/middleware/project-auth.middleware';
import { logActivity } from '../../shared/utils/activityLogger';


const router = Router();

/**
 * @swagger
 * /api/v1/workspaces/{workspaceId}/projects:
 *   post:
 *     summary: Create project in workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Backend API
 *               description:
 *                 type: string
 *                 example: Core backend services
 *     responses:
 *       201:
 *         description: Project created
 */

/**
 * @swagger
 * /api/v1/workspaces/{workspaceId}/projects:
 *   get:
 *     summary: List workspace projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 */


/**
 * CREATE PROJECT
 * Workspace roles allowed: OWNER, COLLABORATOR
 * Automatically adds creator as PROJECT OWNER
 */
router.post(
  '/:workspaceId/projects',
  authenticate,
  requireWorkspaceRole(['OWNER', 'COLLABORATOR']),
  async (req: AuthRequest, res) => {
    const { workspaceId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name required' });
    }

    try {
      // 1. Create project
      const projectResult = await query(
        `
        INSERT INTO projects (workspace_id, name, description, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [workspaceId, name, description || null, req.user!.userId]
      );

      const project = projectResult.rows[0];

      // 2. Add creator as PROJECT OWNER
      await query(
        `
        INSERT INTO project_members (project_id, user_id, role)
        VALUES ($1, $2, 'OWNER')
        `,
        [project.id, req.user!.userId]
      );
      await logActivity({
        actorId: req.user!.userId,
        workspaceId,
        projectId: project.id,
        action: 'PROJECT_CREATED',
        metadata: {
          projectName: project.name
        }
      });      
      return res.status(201).json(project);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to create project' });
    }
  }
);

/**
 * LIST PROJECTS IN A WORKSPACE
 * Workspace roles allowed: OWNER, COLLABORATOR, VIEWER
 */
router.get(
  '/:workspaceId/projects',
  authenticate,
  requireWorkspaceRole(['OWNER', 'COLLABORATOR', 'VIEWER']),
  async (req: AuthRequest, res) => {
    const { workspaceId } = req.params;

    try {
      const result = await query(
        `
        SELECT id, name, description, created_at
        FROM projects
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        `,
        [workspaceId]
      );

      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch projects' });
    }
  }
);

/**
 * DELETE PROJECT
 * Project OWNER only
 */
router.delete(
    '/projects/:projectId',
    authenticate,
    requireProjectRole(['OWNER']),
    async (req: AuthRequest, res) => {
      const { projectId } = req.params;
  
      const result = await query(
        `
        DELETE FROM projects
        WHERE id = $1
        RETURNING id
        `,
        [projectId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      await logActivity({
        actorId: req.user!.userId,
        projectId,
        action: 'PROJECT_DELETED'
      });
      
  
      res.json({ message: 'Project deleted' });
    }
  );
  

export default router;
