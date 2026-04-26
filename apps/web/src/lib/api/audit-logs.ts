import { apiRequest } from "./client";

export type AuditLog = {
  id: string;
  tenantId: string;
  actorUserId: string | null;
  actionType: string;
  resourceType: string;
  resourceId: string;
  beforePayload: Record<string, unknown> | null;
  afterPayload: Record<string, unknown> | null;
  createdAt: string;
};

type AuditLogListResponse = {
  items: AuditLog[];
  count: number;
};

export type ListAuditLogsQuery = {
  tenantId: string;
  actionType?: string;
  resourceType?: string;
  resourceId?: string;
};

function buildQuery(query: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const encoded = searchParams.toString();
  return encoded ? `?${encoded}` : "";
}

export function listAuditLogs(query: ListAuditLogsQuery) {
  return apiRequest<AuditLogListResponse>(
    `/audit-logs${buildQuery({
      tenantId: query.tenantId,
      actionType: query.actionType,
      resourceType: query.resourceType,
      resourceId: query.resourceId,
    })}`,
  );
}
