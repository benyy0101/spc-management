import type { AccountingEvent, JournalDraft } from "@spc/domain";

export type PersistAccountingEventInput = {
  tenantId: string;
  event: AccountingEvent;
  journals: JournalDraft[];
  actorUserId?: string;
};

export type PersistAccountingEventResult = {
  eventId: string;
  persistedEventId: string;
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
