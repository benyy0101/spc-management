import { apiRequest } from "./client";

export type EventRecord = {
  id: string;
  tenantId: string;
  entityId: string;
  entityCode: string;
  bookId: string;
  bookCode: string;
  eventType: string;
  idempotencyKey: string;
  status: string;
  tradeDate: string;
  accountingDate: string;
  settlementDate: string | null;
  currency: string;
  amount: string;
  productId: string | null;
  contractId: string | null;
  counterpartyEntityId: string | null;
  investorId: string | null;
  sourceReference: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type EventListResponse = {
  items: EventRecord[];
  count: number;
};

export type CreateAccountingEventInput = {
  tenantId: string;
  actorUserId?: string;
  accountingBasis: string;
  baseCurrency: string;
  event: {
    eventId: string;
    eventType: "loan_origination" | "interest_accrual" | "principal_repayment";
    entityId: string;
    bookCode: string;
    accountingDate: string;
    tradeDate?: string;
    settlementDate?: string;
    currency: string;
    amount: string;
    productId?: string;
    contractId?: string;
  };
};

export type CreateAccountingEventResponse = {
  eventId: string;
  journals: Array<{
    entityId: string;
    bookCode?: string;
    journalType: string;
    accountingDate: string;
    description?: string;
    lines: Array<{
      accountCode: string;
      side: "debit" | "credit";
      amount: string;
      currency: string;
    }>;
  }>;
  journalCount: number;
  skippedAsDuplicate: boolean;
};

export async function listEvents(query: {
  tenantId: string;
  entityId?: string;
  eventType?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return apiRequest<EventListResponse>(`/events?${params.toString()}`);
}

export async function createAccountingEvent(input: CreateAccountingEventInput) {
  return apiRequest<CreateAccountingEventResponse>("/accounting-events", {
    method: "POST",
    body: input,
  });
}
