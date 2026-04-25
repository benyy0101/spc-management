import { generateJournalsForEvent } from "@spc/domain";
import type { AccountingEventRepositoryPort } from "../ports/accounting-event-repository";
import type { AuditLogPort } from "../ports/audit-log-port";
import type { PostAccountingEventCommand, PostAccountingEventResult } from "../dto/post-accounting-event";

export type PostAccountingEventDependencies = {
  accountingEventRepository: AccountingEventRepositoryPort;
  auditLog?: AuditLogPort;
};

export const postAccountingEvent = async (
  deps: PostAccountingEventDependencies,
  command: PostAccountingEventCommand,
): Promise<PostAccountingEventResult> => {
  const duplicate = await deps.accountingEventRepository.existsByIdempotencyKey({
    tenantId: command.tenantId,
    eventType: command.event.eventType,
    idempotencyKey: command.event.eventId,
  });

  if (duplicate) {
    return {
      eventId: command.event.eventId,
      journals: [],
      journalCount: 0,
      skippedAsDuplicate: true,
    };
  }

  const journals = generateJournalsForEvent(command.event, {
    accountingBasis: command.accountingBasis,
    baseCurrency: command.baseCurrency,
  });

  const persisted = await deps.accountingEventRepository.persistAccountingEvent({
    event: command.event,
    journals,
  });

  if (deps.auditLog) {
    await deps.auditLog.log({
      tenantId: command.tenantId,
      actorUserId: command.actorUserId,
      actionType: "post_accounting_event",
      resourceType: "event",
      resourceId: persisted.eventId,
      metadata: {
        eventType: command.event.eventType,
        journalCount: persisted.journalCount,
      },
    });
  }

  return {
    eventId: persisted.eventId,
    journals,
    journalCount: persisted.journalCount,
    skippedAsDuplicate: false,
  };
};
