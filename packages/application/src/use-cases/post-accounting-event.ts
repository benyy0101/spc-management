import { generateJournalsForEvent } from "@spc/domain";
import { ClosedPeriodError } from "../errors";
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

  const postingBlocked = await deps.accountingEventRepository.isPostingBlocked({
    tenantId: command.tenantId,
    entityId: command.event.entityId,
    bookCode: command.event.bookCode,
    accountingDate: command.event.accountingDate,
  });

  if (postingBlocked) {
    throw new ClosedPeriodError(`Accounting period is closed for ${command.event.accountingDate}`);
  }

  const journals = generateJournalsForEvent(command.event, {
    accountingBasis: command.accountingBasis,
    baseCurrency: command.baseCurrency,
  });

  const persisted = await deps.accountingEventRepository.persistAccountingEvent({
    tenantId: command.tenantId,
    event: command.event,
    journals,
    actorUserId: command.actorUserId,
  });

  if (deps.auditLog) {
    await deps.auditLog.log({
      tenantId: command.tenantId,
      actorUserId: command.actorUserId,
      actionType: "post_accounting_event",
      resourceType: "event",
      resourceId: persisted.persistedEventId,
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
