import { query } from '../db/postgres';
import { emitWorkspaceEvent } from '../../socket';

interface ActivityLogInput {
  actorId: string;
  workspaceId?: string;
  projectId?: string;
  action: string;
  metadata?: any;
}

export async function logActivity({
  actorId,
  workspaceId,
  projectId,
  action,
  metadata
}: ActivityLogInput) {
  const result = await query(
    `
    INSERT INTO activity_logs (
      actor_id,
      workspace_id,
      project_id,
      action,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      actorId,
      workspaceId || null,
      projectId || null,
      action,
      metadata || null
    ]
  );

  if (workspaceId) {
    emitWorkspaceEvent(workspaceId, result.rows[0]);
  }
}
