import type { AccountingEventRepositoryPort, PersistAccountingEventInput } from "@spc/application";
import {
  accounts,
  auditLogs,
  books,
  closePeriods,
  createDb,
  events,
  journalLines,
  journals,
  tenants,
} from "@spc/db";
import { and, eq, inArray, like, sql } from "drizzle-orm";
import { generateJournalsForEvent, type AccountingEvent, type JournalDraft, type JournalLineInput } from "@spc/domain";
import { InvalidJournalApprovalError, ReferenceDataNotFoundError } from "../errors";
import type {
  ApproveJournalInput,
  ApproveJournalResultReadModel,
  CreateManualJournalInput,
  ManualJournalResultReadModel,
  ReprocessEventInput,
  ReprocessEventResultReadModel,
  ReverseJournalInput,
  ReverseJournalResultReadModel,
} from "../read-models";

type DbClient = ReturnType<typeof createDb>;
type QueryExecutor = Pick<DbClient, "select" | "insert" | "update">;

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

const buildAccountingEventFromRow = (row: {
  event: typeof events.$inferSelect;
  bookCode: string;
}): AccountingEvent => ({
  eventId: row.event.idempotencyKey,
  eventType: row.event.eventType as AccountingEvent["eventType"],
  entityId: row.event.entityId,
  bookCode: row.bookCode,
  accountingDate: String(row.event.accountingDate),
  tradeDate: row.event.tradeDate ? String(row.event.tradeDate) : undefined,
  settlementDate: row.event.settlementDate ? String(row.event.settlementDate) : undefined,
  currency: row.event.currency,
  amount: row.event.amount,
  productId: row.event.productId ?? undefined,
  contractId: row.event.contractId ?? undefined,
  counterpartyEntityId: row.event.counterpartyEntityId ?? undefined,
  investorId: row.event.investorId ?? undefined,
  metadata: (row.event.payloadJson as Record<string, unknown> | null) ?? undefined,
});

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

const insertAuditLog = async (
  db: QueryExecutor,
  input: {
    tenantId: string;
    actorUserId?: string;
    actionType: string;
    resourceType: string;
    resourceId: string;
    beforePayload?: Record<string, unknown> | null;
    afterPayload?: Record<string, unknown> | null;
  },
) => {
  await db.insert(auditLogs).values({
    tenantId: input.tenantId,
    actorUserId: input.actorUserId ?? null,
    actionType: input.actionType,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    beforePayloadJson: input.beforePayload ?? null,
    afterPayloadJson: input.afterPayload ?? null,
  });
};

const fetchJournalWithLines = async (
  db: QueryExecutor,
  tenantId: string,
  journalId: string,
) => {
  const journalRows = await db
    .select({
      journal: journals,
      bookCode: books.code,
    })
    .from(journals)
    .innerJoin(books, eq(books.id, journals.bookId))
    .where(and(eq(journals.tenantId, tenantId), eq(journals.id, journalId)))
    .limit(1);

  const journalRow = journalRows[0];
  if (!journalRow) {
    return null;
  }

  const lineRows = await db
    .select({
      line: journalLines,
      accountCode: accounts.code,
    })
    .from(journalLines)
    .innerJoin(accounts, eq(accounts.id, journalLines.accountId))
    .where(and(eq(journalLines.tenantId, tenantId), eq(journalLines.journalId, journalId)));

  return { journalRow, lineRows: lineRows.sort((a, b) => a.line.lineNo - b.line.lineNo) };
};

const createReversalForJournal = async (
  db: QueryExecutor,
  input: {
    tenantId: string;
    journalId: string;
    reversalDate?: string;
    actorUserId?: string;
  },
): Promise<ReverseJournalResultReadModel | null> => {
  const loaded = await fetchJournalWithLines(db, input.tenantId, input.journalId);
  if (!loaded) {
    return null;
  }

  const { journalRow, lineRows } = loaded;
  if (journalRow.journal.postingStatus === "reversed") {
    return null;
  }

  const reversalDate = input.reversalDate ?? String(journalRow.journal.accountingDate);
  const blocked = await db
    .select({ id: closePeriods.id })
    .from(closePeriods)
    .where(
      and(
        eq(closePeriods.tenantId, input.tenantId),
        eq(closePeriods.entityId, journalRow.journal.entityId),
        eq(closePeriods.bookId, journalRow.journal.bookId),
        eq(closePeriods.status, "closed"),
        sql`${closePeriods.periodStart} <= ${reversalDate}::date`,
        sql`${closePeriods.periodEnd} >= ${reversalDate}::date`,
      ),
    )
    .limit(1);

  if (blocked[0]) {
    throw new ReferenceDataNotFoundError(`Cannot reverse journal ${journalRow.journal.journalNo} in a closed period`);
  }

  const reversalJournalNo = await nextJournalNumber(db, input.tenantId, reversalDate);
  const insertedReversal = await db
    .insert(journals)
    .values({
      tenantId: input.tenantId,
      entityId: journalRow.journal.entityId,
      bookId: journalRow.journal.bookId,
      sourceEventId: journalRow.journal.sourceEventId,
      journalNo: reversalJournalNo,
      journalType: "reversal",
      accountingDate: reversalDate,
      postingStatus: "posted",
      description: `Reversal of ${journalRow.journal.journalNo}`,
      createdBy: input.actorUserId ?? null,
      postedAt: new Date(),
    })
    .returning({ id: journals.id });

  const reversalJournalId = insertedReversal[0].id;
  for (const [index, row] of lineRows.entries()) {
    await db.insert(journalLines).values({
      tenantId: input.tenantId,
      journalId: reversalJournalId,
      lineNo: index + 1,
      accountId: row.line.accountId,
      debitAmount: row.line.creditAmount,
      creditAmount: row.line.debitAmount,
      currency: row.line.currency,
      amountScale: row.line.amountScale,
      fxRate: row.line.fxRate,
      amountInFunctionalCurrency: row.line.amountInFunctionalCurrency,
      productId: row.line.productId,
      contractId: row.line.contractId,
      counterpartyEntityId: row.line.counterpartyEntityId,
      investorId: row.line.investorId,
      description: row.line.description,
    });
  }

  await db
    .update(journals)
    .set({
      postingStatus: "reversed",
      updatedAt: new Date(),
    })
    .where(and(eq(journals.tenantId, input.tenantId), eq(journals.id, input.journalId)));

  await insertAuditLog(db, {
    tenantId: input.tenantId,
    actorUserId: input.actorUserId,
    actionType: "reverse_journal",
    resourceType: "journal",
    resourceId: input.journalId,
    afterPayload: {
      reversalJournalId,
      reversalJournalNo,
    },
  });

  return {
    originalJournalId: journalRow.journal.id,
    originalJournalNo: journalRow.journal.journalNo,
    reversalJournalId,
    reversalJournalNo,
    accountingDate: reversalDate,
  };
};

const insertDraftJournals = async (
  db: QueryExecutor,
  input: {
    tenantId: string;
    sourceEventId: string;
    actorUserId?: string;
    journals: JournalDraft[];
  },
) => {
  const created: Array<{ id: string; journalNo: string }> = [];

  for (const draft of input.journals) {
    const draftBookId = await resolveBookId(db, {
      tenantId: input.tenantId,
      entityId: draft.entityId,
      bookCode: draft.bookCode,
    });
    const accountIds = await resolveAccountIds(db, input.tenantId, draft.lines);
    const journalNo = await nextJournalNumber(db, input.tenantId, draft.accountingDate);
    const insertedJournals = await db
      .insert(journals)
      .values({
        tenantId: input.tenantId,
        entityId: draft.entityId,
        bookId: draftBookId,
        sourceEventId: input.sourceEventId,
        journalNo,
        journalType: "reprocess",
        accountingDate: draft.accountingDate,
        postingStatus: "posted",
        description: draft.description ?? null,
        createdBy: input.actorUserId ?? null,
        postedAt: new Date(),
      })
      .returning({ id: journals.id, journalNo: journals.journalNo });

    await insertJournalLines(db, {
      tenantId: input.tenantId,
      journalId: insertedJournals[0].id,
      lines: draft.lines,
      accountIds,
    });

    created.push(insertedJournals[0]);
  }

  return created;
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

  async isPostingBlocked(input: {
    tenantId: string;
    entityId: string;
    bookCode?: string;
    accountingDate: string;
  }) {
    const bookId = await resolveBookId(db, {
      tenantId: input.tenantId,
      entityId: input.entityId,
      bookCode: input.bookCode,
    });

    const matched = await db
      .select({ id: closePeriods.id })
      .from(closePeriods)
      .where(
        and(
          eq(closePeriods.tenantId, input.tenantId),
          eq(closePeriods.entityId, input.entityId),
          eq(closePeriods.bookId, bookId),
          eq(closePeriods.status, "closed"),
          sql`${closePeriods.periodStart} <= ${input.accountingDate}::date`,
          sql`${closePeriods.periodEnd} >= ${input.accountingDate}::date`,
        ),
      )
      .limit(1);

    return Boolean(matched[0]);
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

export const reverseJournal = async (
  db: DbClient,
  input: ReverseJournalInput,
): Promise<ReverseJournalResultReadModel | null> =>
  db.transaction((tx) =>
    createReversalForJournal(tx, {
      tenantId: input.tenantId,
      journalId: input.journalId,
      reversalDate: input.reversalDate,
      actorUserId: input.actorUserId,
    }),
  );

export const reprocessEvent = async (
  db: DbClient,
  input: ReprocessEventInput,
): Promise<ReprocessEventResultReadModel | null> =>
  db.transaction(async (tx) => {
    const eventRows = await tx
      .select({
        event: events,
        bookCode: books.code,
        accountingBasis: books.accountingBasis,
        baseCurrency: tenants.baseCurrency,
      })
      .from(events)
      .innerJoin(books, eq(books.id, events.bookId))
      .innerJoin(tenants, eq(tenants.id, events.tenantId))
      .where(and(eq(events.tenantId, input.tenantId), eq(events.id, input.eventId)))
      .limit(1);

    const eventRow = eventRows[0];
    if (!eventRow) {
      return null;
    }

    const activeJournals = await tx
      .select({ id: journals.id })
      .from(journals)
      .where(
        and(
          eq(journals.tenantId, input.tenantId),
          eq(journals.sourceEventId, input.eventId),
          eq(journals.postingStatus, "posted"),
          inArray(journals.journalType, ["auto", "reprocess"]),
        ),
      );

    let reversedJournalCount = 0;
    for (const journal of activeJournals) {
      const reversed = await createReversalForJournal(tx, {
        tenantId: input.tenantId,
        journalId: journal.id,
        reversalDate: String(eventRow.event.accountingDate),
        actorUserId: input.actorUserId,
      });
      if (reversed) {
        reversedJournalCount += 1;
      }
    }

    const sourceEvent = buildAccountingEventFromRow({
      event: eventRow.event,
      bookCode: eventRow.bookCode,
    });
    const drafts = generateJournalsForEvent(sourceEvent, {
      accountingBasis: eventRow.accountingBasis,
      baseCurrency: eventRow.baseCurrency,
    });

    const created = await insertDraftJournals(tx, {
      tenantId: input.tenantId,
      sourceEventId: input.eventId,
      actorUserId: input.actorUserId,
      journals: drafts,
    });

    await tx
      .update(events)
      .set({
        status: "posted",
        updatedAt: new Date(),
      })
      .where(and(eq(events.tenantId, input.tenantId), eq(events.id, input.eventId)));

    await insertAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actionType: "reprocess_event",
      resourceType: "event",
      resourceId: input.eventId,
      afterPayload: {
        reversedJournalCount,
        newJournalCount: created.length,
        journalNos: created.map((row) => row.journalNo),
      },
    });

    return {
      eventId: input.eventId,
      reversedJournalCount,
      newJournalCount: created.length,
      journalNos: created.map((row) => row.journalNo),
    };
  });

export const createManualJournal = async (
  db: DbClient,
  input: CreateManualJournalInput,
): Promise<ManualJournalResultReadModel> =>
  db.transaction(async (tx) => {
    const bookId = await resolveBookId(tx, {
      tenantId: input.tenantId,
      entityId: input.entityId,
      bookCode: input.bookCode,
    });

    const blocked = await tx
      .select({ id: closePeriods.id })
      .from(closePeriods)
      .where(
        and(
          eq(closePeriods.tenantId, input.tenantId),
          eq(closePeriods.entityId, input.entityId),
          eq(closePeriods.bookId, bookId),
          eq(closePeriods.status, "closed"),
          sql`${closePeriods.periodStart} <= ${input.accountingDate}::date`,
          sql`${closePeriods.periodEnd} >= ${input.accountingDate}::date`,
        ),
      )
      .limit(1);

    if (blocked[0]) {
      throw new ReferenceDataNotFoundError(`Cannot create manual journal in a closed period`);
    }

    const accountIds = await resolveAccountIds(tx, input.tenantId, input.lines);
    const journalNo = await nextJournalNumber(tx, input.tenantId, input.accountingDate);
    const inserted = await tx
      .insert(journals)
      .values({
        tenantId: input.tenantId,
        entityId: input.entityId,
        bookId,
        sourceEventId: null,
        journalNo,
        journalType: "manual",
        accountingDate: input.accountingDate,
        postingStatus: "posted",
        description: input.description ?? null,
        createdBy: input.actorUserId ?? null,
        postedAt: new Date(),
      })
      .returning({ id: journals.id, journalNo: journals.journalNo });

    await insertJournalLines(tx, {
      tenantId: input.tenantId,
      journalId: inserted[0].id,
      lines: input.lines,
      accountIds,
    });

    await insertAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actionType: "create_manual_journal",
      resourceType: "journal",
      resourceId: inserted[0].id,
      afterPayload: {
        journalNo: inserted[0].journalNo,
        lineCount: input.lines.length,
      },
    });

    return {
      journalId: inserted[0].id,
      journalNo: inserted[0].journalNo,
      accountingDate: input.accountingDate,
      lineCount: input.lines.length,
    };
  });

export const approveJournal = async (
  db: DbClient,
  input: ApproveJournalInput,
): Promise<ApproveJournalResultReadModel | null> =>
  db.transaction(async (tx) => {
    const loaded = await tx
      .select({
        id: journals.id,
        journalNo: journals.journalNo,
        postingStatus: journals.postingStatus,
        approvedBy: journals.approvedBy,
      })
      .from(journals)
      .where(and(eq(journals.tenantId, input.tenantId), eq(journals.id, input.journalId)))
      .limit(1);

    const journal = loaded[0];
    if (!journal) {
      return null;
    }

    if (journal.postingStatus === "approved") {
      return {
        journalId: journal.id,
        journalNo: journal.journalNo,
        postingStatus: "approved",
        approvedBy: journal.approvedBy,
      };
    }

    if (journal.postingStatus !== "draft") {
      throw new InvalidJournalApprovalError(
        `Cannot approve journal ${journal.journalNo} from status ${journal.postingStatus}`,
      );
    }

    await tx
      .update(journals)
      .set({
        postingStatus: "approved",
        approvedBy: input.actorUserId ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(journals.tenantId, input.tenantId), eq(journals.id, input.journalId)));

    await insertAuditLog(tx, {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      actionType: "approve_journal",
      resourceType: "journal",
      resourceId: input.journalId,
      afterPayload: {
        journalNo: journal.journalNo,
        postingStatus: "approved",
      },
    });

    return {
      journalId: journal.id,
      journalNo: journal.journalNo,
      postingStatus: "approved",
      approvedBy: input.actorUserId ?? null,
    };
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
