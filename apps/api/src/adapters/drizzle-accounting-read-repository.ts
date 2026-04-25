import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { accounts, books, contracts, createDb, entities, events, journalLines, journals, products, tenants } from "@spc/db";
import type {
  AccountReadModel,
  ContractReadModel,
  EntityReadModel,
  EventListFilters,
  EventReadModel,
  JournalLineReadModel,
  JournalListFilters,
  JournalReadModel,
  ProductReadModel,
  TenantReadModel,
  TrialBalanceFilters,
  TrialBalanceReadModel,
} from "../read-models";

type DbClient = ReturnType<typeof createDb>;

const toIsoDate = (value: string | Date | null) => {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.toISOString().slice(0, 10);
};

const toIsoTimestamp = (value: Date | null) => {
  if (value === null) {
    return null;
  }

  return value.toISOString();
};

const mapEventRow = (row: {
  event: typeof events.$inferSelect;
  entityCode: string;
  bookCode: string;
}): EventReadModel => ({
  id: row.event.id,
  tenantId: row.event.tenantId,
  entityId: row.event.entityId,
  entityCode: row.entityCode,
  bookId: row.event.bookId,
  bookCode: row.bookCode,
  eventType: row.event.eventType,
  idempotencyKey: row.event.idempotencyKey,
  status: row.event.status,
  tradeDate: toIsoDate(row.event.tradeDate)!,
  accountingDate: toIsoDate(row.event.accountingDate)!,
  settlementDate: toIsoDate(row.event.settlementDate),
  currency: row.event.currency,
  amount: row.event.amount,
  productId: row.event.productId,
  contractId: row.event.contractId,
  counterpartyEntityId: row.event.counterpartyEntityId,
  investorId: row.event.investorId,
  sourceReference: row.event.sourceReference,
  payload: (row.event.payloadJson as Record<string, unknown> | null) ?? null,
  createdAt: row.event.createdAt.toISOString(),
  updatedAt: row.event.updatedAt.toISOString(),
});

const mapJournalRow = (row: {
  journal: typeof journals.$inferSelect;
  entityCode: string;
  bookCode: string;
}): JournalReadModel => ({
  id: row.journal.id,
  tenantId: row.journal.tenantId,
  entityId: row.journal.entityId,
  entityCode: row.entityCode,
  bookId: row.journal.bookId,
  bookCode: row.bookCode,
  sourceEventId: row.journal.sourceEventId,
  journalNo: row.journal.journalNo,
  journalType: row.journal.journalType,
  accountingDate: toIsoDate(row.journal.accountingDate)!,
  postingStatus: row.journal.postingStatus,
  description: row.journal.description,
  postedAt: toIsoTimestamp(row.journal.postedAt),
  createdAt: row.journal.createdAt.toISOString(),
  updatedAt: row.journal.updatedAt.toISOString(),
});

const mapJournalLineRow = (row: {
  line: typeof journalLines.$inferSelect;
  accountCode: string;
  accountName: string;
}): JournalLineReadModel => ({
  id: row.line.id,
  lineNo: row.line.lineNo,
  accountId: row.line.accountId,
  accountCode: row.accountCode,
  accountName: row.accountName,
  debitAmount: row.line.debitAmount,
  creditAmount: row.line.creditAmount,
  currency: row.line.currency,
  amountScale: row.line.amountScale,
  productId: row.line.productId,
  contractId: row.line.contractId,
  counterpartyEntityId: row.line.counterpartyEntityId,
  investorId: row.line.investorId,
  description: row.line.description,
});

export const createDrizzleAccountingReadRepository = (db: DbClient) => ({
  async listTenants(): Promise<TenantReadModel[]> {
    const rows = await db.select().from(tenants).orderBy(asc(tenants.code));

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      status: row.status,
      baseCurrency: row.baseCurrency,
      accountingTimezone: row.accountingTimezone,
    }));
  },

  async listEntities(tenantId: string): Promise<EntityReadModel[]> {
    const rows = await db
      .select()
      .from(entities)
      .where(eq(entities.tenantId, tenantId))
      .orderBy(asc(entities.code));

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      code: row.code,
      name: row.name,
      entityType: row.entityType,
      functionalCurrency: row.functionalCurrency,
      status: row.status,
    }));
  },

  async listAccounts(tenantId: string): Promise<AccountReadModel[]> {
    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.tenantId, tenantId))
      .orderBy(asc(accounts.code));

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      code: row.code,
      name: row.name,
      accountType: row.accountType,
      statementType: row.statementType,
      normalBalance: row.normalBalance,
      isActive: row.isActive,
    }));
  },

  async listProducts(tenantId: string): Promise<ProductReadModel[]> {
    const rows = await db
      .select()
      .from(products)
      .where(eq(products.tenantId, tenantId))
      .orderBy(asc(products.code));

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      code: row.code,
      name: row.name,
      productType: row.productType,
      currency: row.currency,
      status: row.status,
    }));
  },

  async listContracts(tenantId: string): Promise<ContractReadModel[]> {
    const rows = await db
      .select({
        contract: contracts,
        productCode: products.code,
      })
      .from(contracts)
      .innerJoin(products, eq(products.id, contracts.productId))
      .where(eq(contracts.tenantId, tenantId))
      .orderBy(asc(contracts.code), asc(contracts.versionNo));

    return rows.map((row) => ({
      id: row.contract.id,
      tenantId: row.contract.tenantId,
      productId: row.contract.productId,
      productCode: row.productCode,
      code: row.contract.code,
      contractType: row.contract.contractType,
      currency: row.contract.currency,
      effectiveDate: toIsoDate(row.contract.effectiveDate)!,
      maturityDate: toIsoDate(row.contract.maturityDate),
      interestRateType: row.contract.interestRateType,
      interestRate: row.contract.interestRate,
      dayCountConvention: row.contract.dayCountConvention,
      versionNo: row.contract.versionNo,
      status: row.contract.status,
    }));
  },

  async listEvents(filters: EventListFilters): Promise<EventReadModel[]> {
    const conditions = [eq(events.tenantId, filters.tenantId)];

    if (filters.entityId) {
      conditions.push(eq(events.entityId, filters.entityId));
    }

    if (filters.eventType) {
      conditions.push(eq(events.eventType, filters.eventType));
    }

    if (filters.status) {
      conditions.push(eq(events.status, filters.status as "draft" | "validated" | "posted" | "reversed"));
    }

    if (filters.from) {
      conditions.push(gte(events.accountingDate, filters.from));
    }

    if (filters.to) {
      conditions.push(lte(events.accountingDate, filters.to));
    }

    const rows = await db
      .select({
        event: events,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(events)
      .innerJoin(entities, eq(entities.id, events.entityId))
      .innerJoin(books, eq(books.id, events.bookId))
      .where(and(...conditions))
      .orderBy(desc(events.accountingDate), desc(events.createdAt));

    return rows.map(mapEventRow);
  },

  async getEventById(tenantId: string, eventId: string): Promise<EventReadModel | null> {
    const rows = await db
      .select({
        event: events,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(events)
      .innerJoin(entities, eq(entities.id, events.entityId))
      .innerJoin(books, eq(books.id, events.bookId))
      .where(and(eq(events.tenantId, tenantId), eq(events.id, eventId)))
      .limit(1);

    return rows[0] ? mapEventRow(rows[0]) : null;
  },

  async getJournalById(tenantId: string, journalId: string): Promise<JournalReadModel | null> {
    const rows = await db
      .select({
        journal: journals,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(journals)
      .innerJoin(entities, eq(entities.id, journals.entityId))
      .innerJoin(books, eq(books.id, journals.bookId))
      .where(and(eq(journals.tenantId, tenantId), eq(journals.id, journalId)))
      .limit(1);

    if (!rows[0]) {
      return null;
    }

    const lineRows = await db
      .select({
        line: journalLines,
        accountCode: accounts.code,
        accountName: accounts.name,
      })
      .from(journalLines)
      .innerJoin(accounts, eq(accounts.id, journalLines.accountId))
      .where(and(eq(journalLines.tenantId, tenantId), eq(journalLines.journalId, journalId)))
      .orderBy(asc(journalLines.lineNo));

    return {
      ...mapJournalRow(rows[0]),
      lines: lineRows.map(mapJournalLineRow),
    };
  },

  async listJournals(filters: JournalListFilters): Promise<JournalReadModel[]> {
    const conditions = [eq(journals.tenantId, filters.tenantId)];

    if (filters.entityId) {
      conditions.push(eq(journals.entityId, filters.entityId));
    }

    if (filters.from) {
      conditions.push(gte(journals.accountingDate, filters.from));
    }

    if (filters.to) {
      conditions.push(lte(journals.accountingDate, filters.to));
    }

    const rows = await db
      .select({
        journal: journals,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(journals)
      .innerJoin(entities, eq(entities.id, journals.entityId))
      .innerJoin(books, eq(books.id, journals.bookId))
      .where(and(...conditions))
      .orderBy(desc(journals.accountingDate), desc(journals.createdAt));

    return rows.map(mapJournalRow);
  },

  async getTrialBalance(filters: TrialBalanceFilters): Promise<TrialBalanceReadModel> {
    const conditions = [
      eq(journalLines.tenantId, filters.tenantId),
      lte(journals.accountingDate, filters.asOf),
    ];

    if (filters.entityId) {
      conditions.push(eq(journals.entityId, filters.entityId));
    }

    const rows = await db
      .select({
        accountId: accounts.id,
        accountCode: accounts.code,
        accountName: accounts.name,
        statementType: accounts.statementType,
        normalBalance: accounts.normalBalance,
        debitAmount: sql<string>`coalesce(sum(${journalLines.debitAmount}), 0)::text`,
        creditAmount: sql<string>`coalesce(sum(${journalLines.creditAmount}), 0)::text`,
        balanceAmount:
          sql<string>`(coalesce(sum(${journalLines.debitAmount}), 0) - coalesce(sum(${journalLines.creditAmount}), 0))::text`,
      })
      .from(journalLines)
      .innerJoin(journals, eq(journals.id, journalLines.journalId))
      .innerJoin(accounts, eq(accounts.id, journalLines.accountId))
      .where(and(...conditions))
      .groupBy(accounts.id, accounts.code, accounts.name, accounts.statementType, accounts.normalBalance)
      .orderBy(asc(accounts.code));

    const totalDebit = rows.reduce((sum, row) => sum + Number(row.debitAmount), 0);
    const totalCredit = rows.reduce((sum, row) => sum + Number(row.creditAmount), 0);

    return {
      tenantId: filters.tenantId,
      entityId: filters.entityId,
      asOf: filters.asOf,
      rows,
      totals: {
        debitAmount: totalDebit.toFixed(2),
        creditAmount: totalCredit.toFixed(2),
      },
    };
  },
});
