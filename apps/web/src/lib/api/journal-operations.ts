import { apiRequest } from "./client";

export type ManualJournalLineInput = {
  accountCode: string;
  side: "debit" | "credit";
  amount: string;
  currency: string;
  description?: string;
};

export type CreateManualJournalInput = {
  tenantId: string;
  entityId: string;
  bookCode?: string;
  accountingDate: string;
  description?: string;
  actorUserId?: string;
  lines: ManualJournalLineInput[];
};

export type ManualJournalResult = {
  journalId: string;
  journalNo: string;
  accountingDate: string;
  lineCount: number;
};

export type ApproveJournalResult = {
  journalId: string;
  journalNo: string;
  postingStatus: "approved";
  approvedBy: string | null;
};

export type ReverseJournalInput = {
  reversalDate?: string;
  actorUserId?: string;
};

export type ReverseJournalResult = {
  originalJournalId: string;
  originalJournalNo: string;
  reversalJournalId: string;
  reversalJournalNo: string;
  accountingDate: string;
};

export type ReprocessEventResult = {
  eventId: string;
  reversedJournalCount: number;
  newJournalCount: number;
  journalNos: string[];
};

export function createManualJournal(input: CreateManualJournalInput) {
  return apiRequest<ManualJournalResult>("/journals/manual", {
    method: "POST",
    body: input,
  });
}

export function approveJournal(tenantId: string, journalId: string) {
  return apiRequest<ApproveJournalResult>(`/journals/${journalId}/approve?tenantId=${encodeURIComponent(tenantId)}`, {
    method: "POST",
  });
}

export function reverseJournal(tenantId: string, journalId: string, input: ReverseJournalInput = {}) {
  return apiRequest<ReverseJournalResult>(`/journals/${journalId}/reverse?tenantId=${encodeURIComponent(tenantId)}`, {
    method: "POST",
    body: input,
  });
}

export function reprocessEvent(tenantId: string, eventId: string) {
  return apiRequest<ReprocessEventResult>(`/events/${eventId}/reprocess?tenantId=${encodeURIComponent(tenantId)}`, {
    method: "POST",
  });
}
