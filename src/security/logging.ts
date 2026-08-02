import "server-only";

type SecurityLog = { event: string; outcome: "allowed" | "denied" | "failed"; actorId?: string; resourceId?: string; reason?: string };
const clean = (value?: string) => value?.replace(/[\r\n\t]/g, " ").slice(0, 160);

export function securityLog(entry: SecurityLog) {
  console.info(JSON.stringify({ timestamp: new Date().toISOString(), category: "security", event: clean(entry.event), outcome: entry.outcome, actor_id: clean(entry.actorId), resource_id: clean(entry.resourceId), reason: clean(entry.reason) }));
}
