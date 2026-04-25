import { apiRequest } from "./client";

export type JournalLineRecord = {
  id: string;
  lineNo: number;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: string;
  creditAmount: string;
  currency: string;
  amountScale: number;
  productId: string | null;
  contractId: string | null;
  counterpartyEntityId: string | null;
  investorId: string | null;
  description: string | null;
};

export type JournalRecord = {
  id: string;
  tenantId: string;
  entityId: string;
  entityCode: string;
  bookId: string;
  bookCode: string;
  sourceEventId: string | null;
  journalNo: string;
  journalType: string;
  accountingDate: string;
  postingStatus: string;
  description: string | null;
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lines?: JournalLineRecord[];
};

export type JournalListResponse = {
  items: JournalRecord[];
  count: number;
};

export async function listJournals(query: {
  tenantId: string;
  entityId?: string;
  from?: string;
  to?: string;
}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return apiRequest<JournalListResponse>(`/journals?${params.toString()}`);
}

export async function getJournalById(tenantId: string, journalId: string) {
  const params = new URLSearchParams({ tenantId });
  return apiRequest<JournalRecord>(`/journals/${journalId}?${params.toString()}`);
}
