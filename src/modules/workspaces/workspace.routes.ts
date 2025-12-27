import { Router } from 'express';
import { authenticate, AuthRequest } from '../../shared/middleware/auth.middleware';
import { query } from '../../shared/db/postgres';

const router = Router();

/**
 * @swagger
 * /api/v1/workspaces:
 *   post:
 *     summary: Create a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created
 */

/**
 * CREATE WORKSPACE
 * POST /api/v1/workspaces
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  console.log('USER FROM TOKEN:', req.user);
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Workspace name is required' });
  }

  try {
    // 1. Create workspace
    const workspaceResult = await query(
      `INSERT INTO workspaces (name, created_by)
       VALUES ($1, $2)
       RETURNING id, name, created_at`,
      [name, req.user!.userId]
    );

    const workspace = workspaceResult.rows[0];

    // 2. Add creator as OWNER
    await query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'OWNER')`,
      [workspace.id, req.user!.userId]
    );

    return res.status(201).json(workspace);
  } catch (err) {
    console.error('CREATE WORKSPACE ERROR:', err);
    return res.status(500).json({ message: 'Failed to create workspace' });
  }
});

/**
 * INVITE USER TO WORKSPACE
 * POST /api/v1/workspaces/:workspaceId/invite
 */

/**
 * @swagger
 * /api/v1/workspaces/{workspaceId}/members:
 *   post:
 *     summary: Add member to workspace
 *     tags: [Workspaces]
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
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               role:
 *                 type: string
 *                 example: COLLABORATOR
 *     responses:
 *       201:
 *         description: Member added
 */


router.post('/:workspaceId/invite', authenticate, async (req: AuthRequest, res) => {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
  
    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }
  
    if (!['COLLABORATOR', 'VIEWER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
  
    try {
      // 1. Check inviter is OWNER
      const ownerCheck = await query(
        `
        SELECT role FROM workspace_members
        WHERE workspace_id = $1 AND user_id = $2
        `,
        [workspaceId, req.user!.userId]
      );
  
      if (ownerCheck.rowCount === 0 || ownerCheck.rows[0].role !== 'OWNER') {
        return res.status(403).json({ message: 'Only OWNER can invite users' });
      }
  
      // 2. Find user by email
      const userResult = await query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
      );
  
      if (userResult.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const invitedUserId = userResult.rows[0].id;
  
      // 3. Prevent self-invite
      if (invitedUserId === req.user!.userId) {
        return res.status(400).json({ message: 'Cannot invite yourself' });
      }
  
      // 4. Add member
      await query(
        `
        INSERT INTO workspace_members (workspace_id, user_id, role)
        VALUES ($1, $2, $3)
        `,
        [workspaceId, invitedUserId, role]
      );
  
      return res.status(201).json({
        message: 'User invited successfully'
      });
    } catch (err: any) {
      // Unique constraint violation
      if (err.code === '23505') {
        return res.status(409).json({ message: 'User already a member' });
      }
  
      console.error(err);
      return res.status(500).json({ message: 'Failed to invite user' });
    }
  });


/**
 * LIST USER WORKSPACES
 * GET /api/v1/workspaces
 */

/**
 * @swagger
 * /api/v1/workspaces:
 *   get:
 *     summary: List user workspaces
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */


router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `
      SELECT
        w.id,
        w.name,
        wm.role,
        w.created_at
      FROM workspaces w
      JOIN workspace_members wm
        ON w.id = wm.workspace_id
      WHERE wm.user_id = $1
      ORDER BY w.created_at DESC
      `,
      [req.user!.userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch workspaces' });
  }
});

export default router;
