export interface AuditLogPort {
  log(input: {
    tenantId: string;
    actionType: string;
    resourceType: string;
    resourceId: string;
    actorUserId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}
