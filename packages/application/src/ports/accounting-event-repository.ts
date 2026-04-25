import type { AccountingEvent, JournalDraft } from "@spc/domain";

export type PersistAccountingEventInput = {
  event: AccountingEvent;
  journals: JournalDraft[];
};

export type PersistAccountingEventResult = {
  eventId: string;
  journalCount: number;
};

export interface AccountingEventRepositoryPort {
  existsByIdempotencyKey(input: {
    tenantId: string;
    eventType: string;
    idempotencyKey: string;
  }): Promise<boolean>;

  persistAccountingEvent(input: PersistAccountingEventInput): Promise<PersistAccountingEventResult>;
}
