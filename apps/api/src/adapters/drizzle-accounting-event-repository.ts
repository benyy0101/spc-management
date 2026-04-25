import type { AccountingEventRepositoryPort, PersistAccountingEventInput } from "@spc/application";
import {
  accounts,
  auditLogs,
  books,
  createDb,
  events,
  journalLines,
  journals,
} from "@spc/db";
import { and, eq, like, sql } from "drizzle-orm";
import type { JournalDraft, JournalLineInput } from "@spc/domain";
import { ReferenceDataNotFoundError } from "../errors";

type DbClient = ReturnType<typeof createDb>;
type QueryExecutor = Pick<DbClient, "select" | "insert">;

const amountScaleForCurrency = (currency: string) => {
  if (currency === "KRW") {
    return 0;
  }

  return 2;
};

const toJournalNumberPrefix = (accountingDate: string) => `JV-${accountingDate.slice(0, 7).replace("-", "")}`;

const resolveBookId = async (
  db: QueryExecutor,
  input: {
    tenantId: string;
    entityId: string;
    bookCode?: string;
  },
) => {
  if (input.bookCode) {
    const byCode = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.tenantId, input.tenantId), eq(books.entityId, input.entityId), eq(books.code, input.bookCode)))
      .limit(1);

    if (!byCode[0]) {
      throw new ReferenceDataNotFoundError(`Book not found for code ${input.bookCode}`);
    }

    return byCode[0].id;
  }

  const primary = await db
    .select({ id: books.id })
    .from(books)
    .where(and(eq(books.tenantId, input.tenantId), eq(books.entityId, input.entityId)))
    .limit(1);

  if (!primary[0]) {
    throw new ReferenceDataNotFoundError(`Book not found for entity ${input.entityId}`);
  }

  return primary[0].id;
};

const resolveAccountIds = async (db: QueryExecutor, tenantId: string, lines: JournalLineInput[]) => {
  const accountIds = new Map<string, string>();

  for (const line of lines) {
    if (accountIds.has(line.accountCode)) {
      continue;
    }

    const account = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, line.accountCode)))
      .limit(1);

    if (!account[0]) {
      throw new ReferenceDataNotFoundError(`Account not found for code ${line.accountCode}`);
    }

    accountIds.set(line.accountCode, account[0].id);
  }

  return accountIds;
};

const nextJournalNumber = async (db: QueryExecutor, tenantId: string, accountingDate: string) => {
  const prefix = toJournalNumberPrefix(accountingDate);
  const matched = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(journals)
    .where(and(eq(journals.tenantId, tenantId), like(journals.journalNo, `${prefix}-%`)));

  const sequence = (matched[0]?.count ?? 0) + 1;
  return `${prefix}-${String(sequence).padStart(6, "0")}`;
};

const insertJournalLines = async (
  db: QueryExecutor,
  input: {
    tenantId: string;
    journalId: string;
    lines: JournalLineInput[];
    accountIds: Map<string, string>;
  },
) => {
  for (const [index, line] of input.lines.entries()) {
    const amountScale = amountScaleForCurrency(line.currency);
    await db.insert(journalLines).values({
      tenantId: input.tenantId,
      journalId: input.journalId,
      lineNo: index + 1,
      accountId: input.accountIds.get(line.accountCode)!,
      debitAmount: line.side === "debit" ? line.amount : "0",
      creditAmount: line.side === "credit" ? line.amount : "0",
      currency: line.currency,
      amountScale,
      amountInFunctionalCurrency: line.amount,
      productId: line.productId ?? null,
      contractId: line.contractId ?? null,
      counterpartyEntityId: line.counterpartyEntityId ?? null,
      investorId: line.investorId ?? null,
      description: line.description ?? null,
    });
  }
};

export const createDrizzleAccountingEventRepository = (db: DbClient): AccountingEventRepositoryPort => ({
  async existsByIdempotencyKey(input: {
    tenantId: string;
    eventType: string;
    idempotencyKey: string;
  }) {
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(
          eq(events.tenantId, input.tenantId),
          eq(events.eventType, input.eventType),
          eq(events.idempotencyKey, input.idempotencyKey),
        ),
      )
      .limit(1);

    return Boolean(existing[0]);
  },

  async persistAccountingEvent(input: PersistAccountingEventInput) {
    return db.transaction(async (tx) => {
      const sourceBookId = await resolveBookId(tx, {
        tenantId: input.tenantId,
        entityId: input.event.entityId,
        bookCode: input.event.bookCode,
      });

      const insertedEvents = await tx
        .insert(events)
        .values({
          tenantId: input.tenantId,
          entityId: input.event.entityId,
          bookId: sourceBookId,
          eventType: input.event.eventType,
          idempotencyKey: input.event.eventId,
          status: "posted",
          tradeDate: input.event.tradeDate ?? input.event.accountingDate,
          accountingDate: input.event.accountingDate,
          settlementDate: input.event.settlementDate ?? null,
          currency: input.event.currency,
          amount: input.event.amount,
          productId: input.event.productId ?? null,
          contractId: input.event.contractId ?? null,
          counterpartyEntityId: input.event.counterpartyEntityId ?? null,
          investorId: input.event.investorId ?? null,
          sourceReference: input.event.eventId,
          payloadJson: input.event.metadata ?? null,
          createdBy: input.actorUserId ?? null,
        })
        .returning({ id: events.id });

      const sourceEventId = insertedEvents[0].id;

      for (const draft of input.journals) {
        const draftBookId = await resolveBookId(tx, {
          tenantId: input.tenantId,
          entityId: draft.entityId,
          bookCode: draft.bookCode,
        });
        const accountIds = await resolveAccountIds(tx, input.tenantId, draft.lines);
        const journalNo = await nextJournalNumber(tx, input.tenantId, draft.accountingDate);
        const insertedJournals = await tx
          .insert(journals)
          .values({
            tenantId: input.tenantId,
            entityId: draft.entityId,
            bookId: draftBookId,
            sourceEventId,
            journalNo,
            journalType: draft.journalType,
            accountingDate: draft.accountingDate,
            postingStatus: "posted",
            description: draft.description ?? null,
            createdBy: input.actorUserId ?? null,
            postedAt: new Date(),
          })
          .returning({ id: journals.id });

        await insertJournalLines(tx, {
          tenantId: input.tenantId,
          journalId: insertedJournals[0].id,
          lines: draft.lines,
          accountIds,
        });
      }

      return {
        eventId: input.event.eventId,
        persistedEventId: sourceEventId,
        journalCount: input.journals.length,
      };
    });
  },
});

export const createDrizzleAuditLogPort = (db: DbClient) => ({
  async log(input: {
    tenantId: string;
    actorUserId?: string;
    actionType: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
  }) {
    await db.insert(auditLogs).values({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId ?? null,
      actionType: input.actionType,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      afterPayloadJson: input.metadata ?? null,
    });
  },
});
