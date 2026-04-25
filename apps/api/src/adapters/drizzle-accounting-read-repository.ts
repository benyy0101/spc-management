import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
  accounts,
  auditLogs,
  books,
  closePeriods,
  contracts,
  createDb,
  entities,
  events,
  journalLines,
  journals,
  products,
  statementMappings,
  tenants,
} from "@spc/db";
import { fundInvestorPositions, investorAllocations, investors } from "@spc/db";
import type {
  AccountReadModel,
  AuditLogFilters,
  AuditLogReadModel,
  AllocationListFilters,
  BalanceSheetFilters,
  ClosePeriodListFilters,
  ClosePeriodReadModel,
  ContractReadModel,
  CreateClosePeriodInput,
  CreateStatementMappingInput,
  EntityReadModel,
  EventListFilters,
  EventReadModel,
  FinancialStatementReadModel,
  InvestorAllocationReadModel,
  InvestorPositionFilters,
  InvestorPositionReadModel,
  JournalLineReadModel,
  JournalListFilters,
  JournalReadModel,
  PeriodStatementFilters,
  ProductReadModel,
  RunAllocationInput,
  StatementMappingReadModel,
  TenantReadModel,
  TrialBalanceFilters,
  TrialBalanceReadModel,
  UpdateClosePeriodStatusInput,
  UpdateStatementMappingInput,
} from "../read-models";
import { InvalidClosePeriodTransitionError } from "../errors";

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

const mapStatementTotal = (rows: Array<{ amount: string }>) =>
  rows.reduce((sum, row) => sum + Number(row.amount), 0).toFixed(2);

const mapStatementMappingRow = (row: {
  mapping: typeof statementMappings.$inferSelect;
  accountCode: string;
  accountName: string;
}): StatementMappingReadModel => ({
  id: row.mapping.id,
  tenantId: row.mapping.tenantId,
  accountId: row.mapping.accountId,
  accountCode: row.accountCode,
  accountName: row.accountName,
  statementType: row.mapping.statementType,
  lineCode: row.mapping.lineCode,
  lineName: row.mapping.lineName,
  displayOrder: row.mapping.displayOrder,
});

const mapClosePeriodRow = (row: {
  closePeriod: typeof closePeriods.$inferSelect;
  entityCode: string;
  bookCode: string;
}): ClosePeriodReadModel => ({
  id: row.closePeriod.id,
  tenantId: row.closePeriod.tenantId,
  entityId: row.closePeriod.entityId,
  entityCode: row.entityCode,
  bookId: row.closePeriod.bookId,
  bookCode: row.bookCode,
  periodType: row.closePeriod.periodType,
  periodStart: toIsoDate(row.closePeriod.periodStart)!,
  periodEnd: toIsoDate(row.closePeriod.periodEnd)!,
  status: row.closePeriod.status,
  closedAt: toIsoTimestamp(row.closePeriod.closedAt),
  closedBy: row.closePeriod.closedBy,
  createdAt: row.closePeriod.createdAt.toISOString(),
  updatedAt: row.closePeriod.updatedAt.toISOString(),
});

const mapInvestorPositionRow = (row: {
  position: typeof fundInvestorPositions.$inferSelect;
  fundEntityCode: string;
  investorCode: string;
  investorName: string;
}): InvestorPositionReadModel => ({
  id: row.position.id,
  tenantId: row.position.tenantId,
  fundEntityId: row.position.fundEntityId,
  fundEntityCode: row.fundEntityCode,
  investorId: row.position.investorId,
  investorCode: row.investorCode,
  investorName: row.investorName,
  ownershipRatio: row.position.ownershipRatio,
  commitmentAmount: row.position.commitmentAmount,
  paidInAmount: row.position.paidInAmount,
  effectiveFrom: toIsoDate(row.position.effectiveFrom)!,
  effectiveTo: toIsoDate(row.position.effectiveTo),
});

const mapInvestorAllocationRow = (row: {
  allocation: typeof investorAllocations.$inferSelect;
  fundEntityCode: string;
  investorCode: string;
  investorName: string;
}): InvestorAllocationReadModel => ({
  id: row.allocation.id,
  tenantId: row.allocation.tenantId,
  fundEntityId: row.allocation.fundEntityId,
  fundEntityCode: row.fundEntityCode,
  investorId: row.allocation.investorId,
  investorCode: row.investorCode,
  investorName: row.investorName,
  periodStart: toIsoDate(row.allocation.periodStart)!,
  periodEnd: toIsoDate(row.allocation.periodEnd)!,
  allocationMethod: row.allocation.allocationMethod,
  sourceAmountType: row.allocation.sourceAmountType,
  sourceAmount: row.allocation.sourceAmount,
  ownershipRatio: row.allocation.ownershipRatio,
  allocatedProfitAmount: row.allocation.allocatedProfitAmount,
  cashDistributionAmount: row.allocation.cashDistributionAmount,
  createdAt: row.allocation.createdAt.toISOString(),
  updatedAt: row.allocation.updatedAt.toISOString(),
});

const mapAuditLogRow = (row: {
  auditLog: typeof auditLogs.$inferSelect;
}): AuditLogReadModel => ({
  id: row.auditLog.id,
  tenantId: row.auditLog.tenantId,
  actorUserId: row.auditLog.actorUserId,
  actionType: row.auditLog.actionType,
  resourceType: row.auditLog.resourceType,
  resourceId: row.auditLog.resourceId,
  beforePayload: (row.auditLog.beforePayloadJson as Record<string, unknown> | null) ?? null,
  afterPayload: (row.auditLog.afterPayloadJson as Record<string, unknown> | null) ?? null,
  createdAt: row.auditLog.createdAt.toISOString(),
});

const canTransitionClosePeriod = (
  from: ClosePeriodReadModel["status"],
  to: ClosePeriodReadModel["status"],
) => {
  if (from === to) {
    return true;
  }

  const transitions: Record<ClosePeriodReadModel["status"], ClosePeriodReadModel["status"][]> = {
    open: ["closing", "closed"],
    closing: ["closed", "reopened"],
    closed: ["reopened"],
    reopened: ["closing", "closed"],
  };

  return transitions[from].includes(to);
};

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

  async listStatementMappings(tenantId: string): Promise<StatementMappingReadModel[]> {
    const rows = await db
      .select({
        mapping: statementMappings,
        accountCode: accounts.code,
        accountName: accounts.name,
      })
      .from(statementMappings)
      .innerJoin(accounts, eq(accounts.id, statementMappings.accountId))
      .where(eq(statementMappings.tenantId, tenantId))
      .orderBy(asc(statementMappings.statementType), asc(statementMappings.displayOrder), asc(accounts.code));

    return rows.map(mapStatementMappingRow);
  },

  async createStatementMapping(input: CreateStatementMappingInput): Promise<StatementMappingReadModel> {
    const inserted = await db
      .insert(statementMappings)
      .values({
        tenantId: input.tenantId,
        accountId: input.accountId,
        statementType: input.statementType,
        lineCode: input.lineCode,
        lineName: input.lineName,
        displayOrder: input.displayOrder,
      })
      .returning();

    const rows = await db
      .select({
        mapping: statementMappings,
        accountCode: accounts.code,
        accountName: accounts.name,
      })
      .from(statementMappings)
      .innerJoin(accounts, eq(accounts.id, statementMappings.accountId))
      .where(eq(statementMappings.id, inserted[0].id))
      .limit(1);

    return mapStatementMappingRow(rows[0]);
  },

  async updateStatementMapping(
    tenantId: string,
    mappingId: string,
    input: UpdateStatementMappingInput,
  ): Promise<StatementMappingReadModel | null> {
    const values: Partial<typeof statementMappings.$inferInsert> = {};

    if (input.lineCode !== undefined) {
      values.lineCode = input.lineCode;
    }

    if (input.lineName !== undefined) {
      values.lineName = input.lineName;
    }

    if (input.displayOrder !== undefined) {
      values.displayOrder = input.displayOrder;
    }

    if (Object.keys(values).length === 0) {
      const current = await db
        .select({
          mapping: statementMappings,
          accountCode: accounts.code,
          accountName: accounts.name,
        })
        .from(statementMappings)
        .innerJoin(accounts, eq(accounts.id, statementMappings.accountId))
        .where(and(eq(statementMappings.tenantId, tenantId), eq(statementMappings.id, mappingId)))
        .limit(1);

      return current[0] ? mapStatementMappingRow(current[0]) : null;
    }

    await db
      .update(statementMappings)
      .set(values)
      .where(and(eq(statementMappings.tenantId, tenantId), eq(statementMappings.id, mappingId)));

    const rows = await db
      .select({
        mapping: statementMappings,
        accountCode: accounts.code,
        accountName: accounts.name,
      })
      .from(statementMappings)
      .innerJoin(accounts, eq(accounts.id, statementMappings.accountId))
      .where(and(eq(statementMappings.tenantId, tenantId), eq(statementMappings.id, mappingId)))
      .limit(1);

    return rows[0] ? mapStatementMappingRow(rows[0]) : null;
  },

  async listClosePeriods(filters: ClosePeriodListFilters): Promise<ClosePeriodReadModel[]> {
    const conditions = [eq(closePeriods.tenantId, filters.tenantId)];

    if (filters.entityId) {
      conditions.push(eq(closePeriods.entityId, filters.entityId));
    }

    if (filters.bookId) {
      conditions.push(eq(closePeriods.bookId, filters.bookId));
    }

    if (filters.status) {
      conditions.push(eq(closePeriods.status, filters.status));
    }

    const rows = await db
      .select({
        closePeriod: closePeriods,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(closePeriods)
      .innerJoin(entities, eq(entities.id, closePeriods.entityId))
      .innerJoin(books, eq(books.id, closePeriods.bookId))
      .where(and(...conditions))
      .orderBy(desc(closePeriods.periodEnd), desc(closePeriods.createdAt));

    return rows.map(mapClosePeriodRow);
  },

  async createClosePeriod(input: CreateClosePeriodInput): Promise<ClosePeriodReadModel> {
    const status = input.status ?? "closed";
    const inserted = await db
      .insert(closePeriods)
      .values({
        tenantId: input.tenantId,
        entityId: input.entityId,
        bookId: input.bookId,
        periodType: input.periodType,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        status,
        closedAt: status === "closed" ? new Date() : null,
        closedBy: input.closedBy ?? null,
      })
      .returning();

    const rows = await db
      .select({
        closePeriod: closePeriods,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(closePeriods)
      .innerJoin(entities, eq(entities.id, closePeriods.entityId))
      .innerJoin(books, eq(books.id, closePeriods.bookId))
      .where(eq(closePeriods.id, inserted[0].id))
      .limit(1);

    return mapClosePeriodRow(rows[0]);
  },

  async updateClosePeriodStatus(
    tenantId: string,
    closePeriodId: string,
    input: UpdateClosePeriodStatusInput,
  ): Promise<ClosePeriodReadModel | null> {
    const currentRows = await db
      .select({
        closePeriod: closePeriods,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(closePeriods)
      .innerJoin(entities, eq(entities.id, closePeriods.entityId))
      .innerJoin(books, eq(books.id, closePeriods.bookId))
      .where(and(eq(closePeriods.tenantId, tenantId), eq(closePeriods.id, closePeriodId)))
      .limit(1);

    const current = currentRows[0];
    if (!current) {
      return null;
    }

    if (!canTransitionClosePeriod(current.closePeriod.status, input.status)) {
      throw new InvalidClosePeriodTransitionError(
        `Cannot transition close period from ${current.closePeriod.status} to ${input.status}`,
      );
    }

    await db
      .update(closePeriods)
      .set({
        status: input.status,
        closedAt: input.status === "closed" ? new Date() : null,
        closedBy: input.status === "closed" ? (input.closedBy ?? null) : null,
        updatedAt: new Date(),
      })
      .where(and(eq(closePeriods.tenantId, tenantId), eq(closePeriods.id, closePeriodId)));

    const rows = await db
      .select({
        closePeriod: closePeriods,
        entityCode: entities.code,
        bookCode: books.code,
      })
      .from(closePeriods)
      .innerJoin(entities, eq(entities.id, closePeriods.entityId))
      .innerJoin(books, eq(books.id, closePeriods.bookId))
      .where(and(eq(closePeriods.tenantId, tenantId), eq(closePeriods.id, closePeriodId)))
      .limit(1);

    return rows[0] ? mapClosePeriodRow(rows[0]) : null;
  },

  async listInvestorPositions(filters: InvestorPositionFilters): Promise<InvestorPositionReadModel[]> {
    const conditions = [eq(fundInvestorPositions.tenantId, filters.tenantId)];
    if (filters.fundEntityId) {
      conditions.push(eq(fundInvestorPositions.fundEntityId, filters.fundEntityId));
    }

    const rows = await db
      .select({
        position: fundInvestorPositions,
        fundEntityCode: entities.code,
        investorCode: investors.code,
        investorName: investors.name,
      })
      .from(fundInvestorPositions)
      .innerJoin(entities, eq(entities.id, fundInvestorPositions.fundEntityId))
      .innerJoin(investors, eq(investors.id, fundInvestorPositions.investorId))
      .where(and(...conditions))
      .orderBy(asc(entities.code), asc(investors.code), desc(fundInvestorPositions.effectiveFrom));

    return rows.map(mapInvestorPositionRow);
  },

  async runAllocations(input: RunAllocationInput): Promise<InvestorAllocationReadModel[]> {
    return db.transaction(async (tx) => {
      const positions = await tx
        .select({
          position: fundInvestorPositions,
          fundEntityCode: entities.code,
          investorCode: investors.code,
          investorName: investors.name,
        })
        .from(fundInvestorPositions)
        .innerJoin(entities, eq(entities.id, fundInvestorPositions.fundEntityId))
        .innerJoin(investors, eq(investors.id, fundInvestorPositions.investorId))
        .where(
          and(
            eq(fundInvestorPositions.tenantId, input.tenantId),
            eq(fundInvestorPositions.fundEntityId, input.fundEntityId),
            sql`${fundInvestorPositions.effectiveFrom} <= ${input.periodEnd}::date`,
            sql`${fundInvestorPositions.effectiveTo} IS NULL OR ${fundInvestorPositions.effectiveTo} >= ${input.periodStart}::date`,
          ),
        )
        .orderBy(asc(investors.code));

      if (positions.length === 0) {
        return [];
      }

      await tx
        .delete(investorAllocations)
        .where(
          and(
            eq(investorAllocations.tenantId, input.tenantId),
            eq(investorAllocations.fundEntityId, input.fundEntityId),
            eq(investorAllocations.periodStart, input.periodStart),
            eq(investorAllocations.periodEnd, input.periodEnd),
            eq(investorAllocations.allocationMethod, input.method),
            eq(investorAllocations.sourceAmountType, input.sourceAmountType ?? "profit"),
          ),
        );

      for (const row of positions) {
        const ratio = Number(row.position.ownershipRatio);
        const allocatedProfitAmount = (Number(input.sourceAmount) * ratio).toFixed(2);
        const cashDistributionAmount = (Number(input.cashDistributionAmount ?? "0") * ratio).toFixed(2);

        await tx.insert(investorAllocations).values({
          tenantId: input.tenantId,
          fundEntityId: input.fundEntityId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          allocationMethod: input.method,
          sourceAmountType: input.sourceAmountType ?? "profit",
          sourceAmount: input.sourceAmount,
          investorId: row.position.investorId,
          ownershipRatio: row.position.ownershipRatio,
          allocatedProfitAmount,
          cashDistributionAmount,
        });
      }

      const allocationRows = await tx
        .select({
          allocation: investorAllocations,
          fundEntityCode: entities.code,
          investorCode: investors.code,
          investorName: investors.name,
        })
        .from(investorAllocations)
        .innerJoin(entities, eq(entities.id, investorAllocations.fundEntityId))
        .innerJoin(investors, eq(investors.id, investorAllocations.investorId))
        .where(
          and(
            eq(investorAllocations.tenantId, input.tenantId),
            eq(investorAllocations.fundEntityId, input.fundEntityId),
            eq(investorAllocations.periodStart, input.periodStart),
            eq(investorAllocations.periodEnd, input.periodEnd),
            eq(investorAllocations.allocationMethod, input.method),
            eq(investorAllocations.sourceAmountType, input.sourceAmountType ?? "profit"),
          ),
        )
        .orderBy(asc(investors.code));

      return allocationRows.map(mapInvestorAllocationRow);
    });
  },

  async listAllocations(filters: AllocationListFilters): Promise<InvestorAllocationReadModel[]> {
    const conditions = [eq(investorAllocations.tenantId, filters.tenantId)];
    if (filters.fundEntityId) {
      conditions.push(eq(investorAllocations.fundEntityId, filters.fundEntityId));
    }
    if (filters.investorId) {
      conditions.push(eq(investorAllocations.investorId, filters.investorId));
    }
    if (filters.periodStart) {
      conditions.push(eq(investorAllocations.periodStart, filters.periodStart));
    }
    if (filters.periodEnd) {
      conditions.push(eq(investorAllocations.periodEnd, filters.periodEnd));
    }

    const rows = await db
      .select({
        allocation: investorAllocations,
        fundEntityCode: entities.code,
        investorCode: investors.code,
        investorName: investors.name,
      })
      .from(investorAllocations)
      .innerJoin(entities, eq(entities.id, investorAllocations.fundEntityId))
      .innerJoin(investors, eq(investors.id, investorAllocations.investorId))
      .where(and(...conditions))
      .orderBy(desc(investorAllocations.periodEnd), asc(investors.code), desc(investorAllocations.createdAt));

    return rows.map(mapInvestorAllocationRow);
  },

  async getAllocationById(tenantId: string, allocationId: string): Promise<InvestorAllocationReadModel | null> {
    const rows = await db
      .select({
        allocation: investorAllocations,
        fundEntityCode: entities.code,
        investorCode: investors.code,
        investorName: investors.name,
      })
      .from(investorAllocations)
      .innerJoin(entities, eq(entities.id, investorAllocations.fundEntityId))
      .innerJoin(investors, eq(investors.id, investorAllocations.investorId))
      .where(and(eq(investorAllocations.tenantId, tenantId), eq(investorAllocations.id, allocationId)))
      .limit(1);

    return rows[0] ? mapInvestorAllocationRow(rows[0]) : null;
  },

  async getInvestorAllocationHistory(tenantId: string, investorId: string): Promise<InvestorAllocationReadModel[]> {
    const rows = await db
      .select({
        allocation: investorAllocations,
        fundEntityCode: entities.code,
        investorCode: investors.code,
        investorName: investors.name,
      })
      .from(investorAllocations)
      .innerJoin(entities, eq(entities.id, investorAllocations.fundEntityId))
      .innerJoin(investors, eq(investors.id, investorAllocations.investorId))
      .where(and(eq(investorAllocations.tenantId, tenantId), eq(investorAllocations.investorId, investorId)))
      .orderBy(desc(investorAllocations.periodEnd), desc(investorAllocations.createdAt));

    return rows.map(mapInvestorAllocationRow);
  },

  async listAuditLogs(filters: AuditLogFilters): Promise<AuditLogReadModel[]> {
    const conditions = [eq(auditLogs.tenantId, filters.tenantId)];
    if (filters.actionType) {
      conditions.push(eq(auditLogs.actionType, filters.actionType));
    }
    if (filters.resourceType) {
      conditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }
    if (filters.resourceId) {
      conditions.push(eq(auditLogs.resourceId, filters.resourceId));
    }

    const rows = await db
      .select({
        auditLog: auditLogs,
      })
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt));

    return rows.map(mapAuditLogRow);
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

  async getBalanceSheet(filters: BalanceSheetFilters): Promise<FinancialStatementReadModel> {
    const conditions = [
      eq(journalLines.tenantId, filters.tenantId),
      eq(statementMappings.statementType, "BS"),
      lte(journals.accountingDate, filters.asOf),
    ];

    if (filters.entityId) {
      conditions.push(eq(journals.entityId, filters.entityId));
    }

    const rows = await db
      .select({
        lineCode: statementMappings.lineCode,
        lineName: statementMappings.lineName,
        statementType: statementMappings.statementType,
        displayOrder: statementMappings.displayOrder,
        amount: sql<string>`(coalesce(sum(${journalLines.debitAmount}), 0) - coalesce(sum(${journalLines.creditAmount}), 0))::text`,
      })
      .from(journalLines)
      .innerJoin(journals, eq(journals.id, journalLines.journalId))
      .innerJoin(statementMappings, and(eq(statementMappings.accountId, journalLines.accountId), eq(statementMappings.tenantId, journalLines.tenantId)))
      .where(and(...conditions))
      .groupBy(statementMappings.lineCode, statementMappings.lineName, statementMappings.statementType, statementMappings.displayOrder)
      .orderBy(asc(statementMappings.displayOrder), asc(statementMappings.lineCode));

    return {
      tenantId: filters.tenantId,
      entityId: filters.entityId,
      statementType: "BS",
      asOf: filters.asOf,
      rows,
      totals: {
        amount: mapStatementTotal(rows),
      },
    };
  },

  async getProfitLoss(filters: PeriodStatementFilters): Promise<FinancialStatementReadModel> {
    const conditions = [
      eq(journalLines.tenantId, filters.tenantId),
      eq(statementMappings.statementType, "PL"),
      gte(journals.accountingDate, filters.from),
      lte(journals.accountingDate, filters.to),
    ];

    if (filters.entityId) {
      conditions.push(eq(journals.entityId, filters.entityId));
    }

    const rows = await db
      .select({
        lineCode: statementMappings.lineCode,
        lineName: statementMappings.lineName,
        statementType: statementMappings.statementType,
        displayOrder: statementMappings.displayOrder,
        amount: sql<string>`sum(case when ${accounts.normalBalance} = 'debit' then ${journalLines.debitAmount} - ${journalLines.creditAmount} else ${journalLines.creditAmount} - ${journalLines.debitAmount} end)::text`,
      })
      .from(journalLines)
      .innerJoin(journals, eq(journals.id, journalLines.journalId))
      .innerJoin(accounts, eq(accounts.id, journalLines.accountId))
      .innerJoin(statementMappings, and(eq(statementMappings.accountId, journalLines.accountId), eq(statementMappings.tenantId, journalLines.tenantId)))
      .where(and(...conditions))
      .groupBy(statementMappings.lineCode, statementMappings.lineName, statementMappings.statementType, statementMappings.displayOrder)
      .orderBy(asc(statementMappings.displayOrder), asc(statementMappings.lineCode));

    return {
      tenantId: filters.tenantId,
      entityId: filters.entityId,
      statementType: "PL",
      from: filters.from,
      to: filters.to,
      rows,
      totals: {
        amount: mapStatementTotal(rows),
      },
    };
  },

  async getCashFlow(filters: PeriodStatementFilters): Promise<FinancialStatementReadModel> {
    const conditions = [
      eq(journalLines.tenantId, filters.tenantId),
      eq(statementMappings.statementType, "CF"),
      gte(journals.accountingDate, filters.from),
      lte(journals.accountingDate, filters.to),
    ];

    if (filters.entityId) {
      conditions.push(eq(journals.entityId, filters.entityId));
    }

    const rows = await db
      .select({
        lineCode: statementMappings.lineCode,
        lineName: statementMappings.lineName,
        statementType: statementMappings.statementType,
        displayOrder: statementMappings.displayOrder,
        amount: sql<string>`sum(case when ${accounts.normalBalance} = 'debit' then ${journalLines.debitAmount} - ${journalLines.creditAmount} else ${journalLines.creditAmount} - ${journalLines.debitAmount} end)::text`,
      })
      .from(journalLines)
      .innerJoin(journals, eq(journals.id, journalLines.journalId))
      .innerJoin(accounts, eq(accounts.id, journalLines.accountId))
      .innerJoin(statementMappings, and(eq(statementMappings.accountId, journalLines.accountId), eq(statementMappings.tenantId, journalLines.tenantId)))
      .where(and(...conditions))
      .groupBy(statementMappings.lineCode, statementMappings.lineName, statementMappings.statementType, statementMappings.displayOrder)
      .orderBy(asc(statementMappings.displayOrder), asc(statementMappings.lineCode));

    return {
      tenantId: filters.tenantId,
      entityId: filters.entityId,
      statementType: "CF",
      from: filters.from,
      to: filters.to,
      rows,
      totals: {
        amount: mapStatementTotal(rows),
      },
    };
  },
});
