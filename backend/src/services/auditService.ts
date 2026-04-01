import db from '../config/db';

export async function addAudit(action: string, object_type: string, object_id: string, details: any, actor_id?: string) {
  await db('audit_logs').insert({
    actor_id: actor_id || null,
    action,
    object_type,
    object_id,
    details,
  });
}
