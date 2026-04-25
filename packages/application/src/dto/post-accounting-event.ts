import type { AccountingEvent, JournalDraft } from "@spc/domain";

export type PostAccountingEventCommand = {
  tenantId: string;
  actorUserId?: string;
  event: AccountingEvent;
  accountingBasis: string;
  baseCurrency: string;
};

export type PostAccountingEventResult = {
  eventId: string;
  journals: JournalDraft[];
  journalCount: number;
  skippedAsDuplicate: boolean;
};
