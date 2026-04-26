import { apiRequest } from "./client";

export type ClosePeriodStatus = "open" | "closing" | "closed" | "reopened";
export type ClosePeriodType = "month" | "quarter" | "year";

export type ClosePeriod = {
  id: string;
  tenantId: string;
  entityId: string;
  entityCode: string;
  bookId: string;
  bookCode: string;
  periodType: ClosePeriodType;
  periodStart: string;
  periodEnd: string;
  status: ClosePeriodStatus;
  closedAt: string | null;
  closedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type ClosePeriodListResponse = {
  items: ClosePeriod[];
  count: number;
};

export type ListClosePeriodsQuery = {
  tenantId: string;
  entityId?: string;
  bookId?: string;
  status?: ClosePeriodStatus;
};

export type CreateClosePeriodInput = {
  tenantId: string;
  entityId: string;
  bookId: string;
  periodType: ClosePeriodType;
  periodStart: string;
  periodEnd: string;
  status?: ClosePeriodStatus;
  closedBy?: string;
};

export type UpdateClosePeriodStatusInput = {
  status: ClosePeriodStatus;
  closedBy?: string;
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

export function listClosePeriods(query: ListClosePeriodsQuery) {
  return apiRequest<ClosePeriodListResponse>(
    `/close-periods${buildQuery({
      tenantId: query.tenantId,
      entityId: query.entityId,
      bookId: query.bookId,
      status: query.status,
    })}`,
  );
}

export function createClosePeriod(input: CreateClosePeriodInput) {
  return apiRequest<ClosePeriod>("/close-periods", {
    method: "POST",
    body: input,
  });
}

export function updateClosePeriodStatus(tenantId: string, closePeriodId: string, input: UpdateClosePeriodStatusInput) {
  return apiRequest<ClosePeriod>(`/close-periods/${closePeriodId}/status${buildQuery({ tenantId })}`, {
    method: "PATCH",
    body: input,
  });
}
