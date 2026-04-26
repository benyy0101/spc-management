import assert from "node:assert/strict";
import test from "node:test";
import { and, eq, sql } from "drizzle-orm";
import { postAccountingEvent } from "@spc/application";
import {
  accounts,
  auditLogs,
  books,
  contracts,
  createDb,
  entities,
  events,
  fundInvestorPositions,
  investors,
  journalLines,
  journals,
  products,
  statementMappings,
  tenants,
} from "@spc/db";
import { buildApp } from "./app";
import { createDrizzleAccountingReadRepository } from "./adapters/drizzle-accounting-read-repository";
import {
  approveJournal,
  createDrizzleAccountingEventRepository,
  createManualJournal,
  createDrizzleAuditLogPort,
  reprocessEvent,
  reverseJournal,
} from "./adapters/drizzle-accounting-event-repository";

const getDatabaseUrl = () => {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required for API integration tests");
  }

  return value;
};

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const normalizeNumeric = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0.00";
  }

  return Number(value).toFixed(2);
};

const resetIntegrationData = async (db: ReturnType<typeof createDb>) => {
  await db.execute(sql`
    TRUNCATE TABLE
      public.audit_logs,
      public.close_adjustment_journals,
      public.close_periods,
      public.event_calculations,
      public.journal_lines,
      public.journals,
      public.events,
      public.investor_allocations,
      public.fund_investor_positions,
      public.contract_parties,
      public.contracts,
      public.products,
      public.investors,
      public.statement_mappings,
      public.accounts,
      public.books,
      public.entities,
      public.fx_rates,
      public.users,
      public.tenants
    RESTART IDENTITY CASCADE
  `);
};

const seedReferenceData = async (db: ReturnType<typeof createDb>) => {
  const insertedTenant = await db
    .insert(tenants)
    .values({
      code: "TENANT-DEMO-001",
      name: "Demo Tenant",
      status: "active",
      baseCurrency: "USD",
      accountingTimezone: "Asia/Seoul",
    })
    .returning();
  const tenant = insertedTenant[0];

  const insertedSpc = await db
    .insert(entities)
    .values({
      tenantId: tenant.id,
      code: "SPC-001",
      name: "Demo SPC",
      entityType: "spc",
      functionalCurrency: "USD",
      status: "active",
    })
    .returning();
  const spcEntity = insertedSpc[0];

  const insertedFund = await db
    .insert(entities)
    .values({
      tenantId: tenant.id,
      code: "OCEAN-FUND-I",
      name: "Ocean Structured Fund I",
      entityType: "fund",
      functionalCurrency: "USD",
      status: "active",
    })
    .returning();
  const fundEntity = insertedFund[0];

  await db.insert(books).values({
    tenantId: tenant.id,
    entityId: spcEntity.id,
    code: "SPC_BOOK",
    name: "SPC Book",
    bookType: "primary",
    accountingBasis: "KGAAP_GENERAL",
    status: "active",
  });

  await db.insert(books).values({
    tenantId: tenant.id,
    entityId: fundEntity.id,
    code: "FUND_BOOK",
    name: "Fund Book",
    bookType: "primary",
    accountingBasis: "KGAAP_GENERAL",
    status: "active",
  });

  await db.insert(accounts).values([
    {
      tenantId: tenant.id,
      code: "111000",
      name: "Cash",
      accountType: "asset",
      statementType: "BS",
      normalBalance: "debit",
    },
    {
      tenantId: tenant.id,
      code: "121000",
      name: "Loan Receivable",
      accountType: "asset",
      statementType: "BS",
      normalBalance: "debit",
    },
    {
      tenantId: tenant.id,
      code: "131000",
      name: "Accrued Interest Receivable",
      accountType: "asset",
      statementType: "BS",
      normalBalance: "debit",
    },
    {
      tenantId: tenant.id,
      code: "411000",
      name: "Interest Income",
      accountType: "revenue",
      statementType: "PL",
      normalBalance: "credit",
    },
  ]);

  const accountRows = await db
    .select({
      id: accounts.id,
      code: accounts.code,
    })
    .from(accounts)
    .where(eq(accounts.tenantId, tenant.id));

  const accountIdByCode = new Map(accountRows.map((row) => [row.code, row.id]));

  await db.insert(statementMappings).values([
    {
      tenantId: tenant.id,
      accountId: accountIdByCode.get("111000")!,
      statementType: "BS",
      lineCode: "CASH",
      lineName: "Cash",
      displayOrder: 10,
    },
    {
      tenantId: tenant.id,
      accountId: accountIdByCode.get("121000")!,
      statementType: "BS",
      lineCode: "LOAN_RECEIVABLE",
      lineName: "Loan Receivable",
      displayOrder: 20,
    },
    {
      tenantId: tenant.id,
      accountId: accountIdByCode.get("131000")!,
      statementType: "BS",
      lineCode: "ACCRUED_INTEREST",
      lineName: "Accrued Interest Receivable",
      displayOrder: 30,
    },
    {
      tenantId: tenant.id,
      accountId: accountIdByCode.get("411000")!,
      statementType: "PL",
      lineCode: "INTEREST_INCOME",
      lineName: "Interest Income",
      displayOrder: 10,
    },
    {
      tenantId: tenant.id,
      accountId: accountIdByCode.get("111000")!,
      statementType: "CF",
      lineCode: "OPERATING_CASH",
      lineName: "Operating Cash Flow",
      displayOrder: 10,
    },
  ]);

  const insertedProduct = await db
    .insert(products)
    .values({
      tenantId: tenant.id,
      code: "LOAN-001",
      name: "Demo Loan",
      productType: "loan_receivable",
      currency: "USD",
      status: "active",
    })
    .returning();
  const product = insertedProduct[0];

  const insertedContract = await db
    .insert(contracts)
    .values({
      tenantId: tenant.id,
      productId: product.id,
      contractType: "loan_agreement",
      code: "CTR-LOAN-001",
      currency: "USD",
      effectiveDate: "2026-01-01",
      maturityDate: "2028-12-31",
      interestRateType: "fixed",
      interestRate: "0.085",
      dayCountConvention: "ACT_360",
      status: "active",
    })
    .returning();

  const insertedInvestors = await db
    .insert(investors)
    .values([
      {
        tenantId: tenant.id,
        code: "LP-ALPHA",
        name: "Alpha Pension Fund",
        investorType: "institutional",
        defaultCurrency: "USD",
        status: "active",
      },
      {
        tenantId: tenant.id,
        code: "LP-BETA",
        name: "Beta Insurance",
        investorType: "institutional",
        defaultCurrency: "USD",
        status: "active",
      },
    ])
    .returning();

  await db.insert(fundInvestorPositions).values([
    {
      tenantId: tenant.id,
      fundEntityId: fundEntity.id,
      investorId: insertedInvestors[0].id,
      commitmentAmount: "0",
      paidInAmount: "0",
      ownershipRatio: "0.60000000",
      effectiveFrom: "2026-01-01",
      effectiveTo: null,
    },
    {
      tenantId: tenant.id,
      fundEntityId: fundEntity.id,
      investorId: insertedInvestors[1].id,
      commitmentAmount: "0",
      paidInAmount: "0",
      ownershipRatio: "0.40000000",
      effectiveFrom: "2026-01-01",
      effectiveTo: null,
    },
  ]);

  return {
    tenant,
    fundEntity,
    spcEntity,
    product: insertedProduct[0],
    contract: insertedContract[0],
  };
};

const setupIntegrationContext = async () => {
  const db = createDb(getDatabaseUrl());
  await resetIntegrationData(db);
  const seeded = await seedReferenceData(db);

  const accountingEventRepository = createDrizzleAccountingEventRepository(db);
  const accountingReadRepository = createDrizzleAccountingReadRepository(db);
  const auditLog = createDrizzleAuditLogPort(db);
  const app = buildApp({
    postAccountingEvent: (command) =>
      postAccountingEvent(
        {
          accountingEventRepository,
          auditLog,
        },
        command,
      ),
    listTenants: () => accountingReadRepository.listTenants(),
    listEntities: (tenantId) => accountingReadRepository.listEntities(tenantId),
    createEntity: (input) => accountingReadRepository.createEntity(input),
    updateEntity: (tenantId, entityId, input) => accountingReadRepository.updateEntity(tenantId, entityId, input),
    listAccounts: (tenantId) => accountingReadRepository.listAccounts(tenantId),
    listStatementMappings: (tenantId) => accountingReadRepository.listStatementMappings(tenantId),
    createStatementMapping: (input) => accountingReadRepository.createStatementMapping(input),
    updateStatementMapping: (tenantId, mappingId, input) =>
      accountingReadRepository.updateStatementMapping(tenantId, mappingId, input),
    listClosePeriods: (filters) => accountingReadRepository.listClosePeriods(filters),
    createClosePeriod: (input) => accountingReadRepository.createClosePeriod(input),
    updateClosePeriodStatus: (tenantId, closePeriodId, input) =>
      accountingReadRepository.updateClosePeriodStatus(tenantId, closePeriodId, input),
    listInvestorPositions: (filters) => accountingReadRepository.listInvestorPositions(filters),
    runAllocations: (input) => accountingReadRepository.runAllocations(input),
    listAllocations: (filters) => accountingReadRepository.listAllocations(filters),
    getAllocationById: (tenantId, allocationId) => accountingReadRepository.getAllocationById(tenantId, allocationId),
    getInvestorAllocationHistory: (tenantId, investorId) =>
      accountingReadRepository.getInvestorAllocationHistory(tenantId, investorId),
    reverseJournal: (input) => reverseJournal(db, input),
    reprocessEvent: (input) => reprocessEvent(db, input),
    createManualJournal: (input) => createManualJournal(db, input),
    approveJournal: (input) => approveJournal(db, input),
    listAuditLogs: (filters) => accountingReadRepository.listAuditLogs(filters),
    listProducts: (tenantId) => accountingReadRepository.listProducts(tenantId),
    listContracts: (tenantId) => accountingReadRepository.listContracts(tenantId),
    listEvents: (filters) => accountingReadRepository.listEvents(filters),
    getEventById: (tenantId, eventId) => accountingReadRepository.getEventById(tenantId, eventId),
    getJournalById: (tenantId, journalId) => accountingReadRepository.getJournalById(tenantId, journalId),
    listJournals: (filters) => accountingReadRepository.listJournals(filters),
    getTrialBalance: (filters) => accountingReadRepository.getTrialBalance(filters),
    getBalanceSheet: (filters) => accountingReadRepository.getBalanceSheet(filters),
    getProfitLoss: (filters) => accountingReadRepository.getProfitLoss(filters),
    getCashFlow: (filters) => accountingReadRepository.getCashFlow(filters),
  });

  return { app, db, ...seeded };
};

test("POST /accounting-events persists event, journals, lines, and audit log", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const response = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-INTEGRATION-001",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });

    assert.equal(response.statusCode, 201, response.body);
    assert.equal(response.json().journalCount, 1);

    const tenantRows = await db.select().from(tenants).where(eq(tenants.id, tenant.id)).limit(1);
    assert.equal(tenantRows[0]?.accountingTimezone, "Asia/Seoul");

    const eventRows = await db
      .select()
      .from(events)
      .where(and(eq(events.tenantId, tenant.id), eq(events.idempotencyKey, "EVT-API-INTEGRATION-001")))
      .limit(1);

    assert.equal(eventRows.length, 1);
    assert.equal(eventRows[0].eventType, "interest_accrual");
    assert.equal(normalizeNumeric(eventRows[0].amount), "42000.00");

    const journalRows = await db
      .select()
      .from(journals)
      .where(and(eq(journals.tenantId, tenant.id), eq(journals.sourceEventId, eventRows[0].id)));

    assert.equal(journalRows.length, 1);
    assert.equal(journalRows[0].journalNo, "JV-202601-000001");
    assert.equal(journalRows[0].postingStatus, "posted");

    const lineRows = await db
      .select()
      .from(journalLines)
      .where(and(eq(journalLines.tenantId, tenant.id), eq(journalLines.journalId, journalRows[0].id)));

    assert.equal(lineRows.length, 2);
    const sortedLines = [...lineRows].sort((a, b) => a.lineNo - b.lineNo);

    const debitAccount = await db
      .select({ code: accounts.code })
      .from(accounts)
      .where(and(eq(accounts.tenantId, tenant.id), eq(accounts.id, sortedLines[0].accountId)))
      .limit(1);
    const creditAccount = await db
      .select({ code: accounts.code })
      .from(accounts)
      .where(and(eq(accounts.tenantId, tenant.id), eq(accounts.id, sortedLines[1].accountId)))
      .limit(1);

    assert.equal(debitAccount[0]?.code, "131000");
    assert.equal(creditAccount[0]?.code, "411000");
    assert.equal(normalizeNumeric(sortedLines[0].debitAmount), "42000.00");
    assert.equal(normalizeNumeric(sortedLines[0].creditAmount), "0.00");
    assert.equal(normalizeNumeric(sortedLines[1].debitAmount), "0.00");
    assert.equal(normalizeNumeric(sortedLines[1].creditAmount), "42000.00");

    const auditRows = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.tenantId, tenant.id), eq(auditLogs.resourceId, eventRows[0].id)));

    assert.equal(auditRows.length, 1);
    assert.equal(auditRows[0].actionType, "post_accounting_event");
    assert.equal(auditRows[0].resourceType, "event");
  } finally {
    await app.close();
  }
});

test(
  "POST /accounting-events skips duplicate idempotency key without creating extra journals",
  { skip: !hasDatabaseUrl },
  async () => {
  const { app, db, tenant, spcEntity, product } = await setupIntegrationContext();

  try {
    const payload = {
      tenantId: tenant.id,
      accountingBasis: "KGAAP_GENERAL",
      baseCurrency: "USD",
      event: {
        eventId: "EVT-API-INTEGRATION-002",
        eventType: "principal_repayment",
        entityId: spcEntity.id,
        bookCode: "SPC_BOOK",
        accountingDate: "2026-02-15",
        tradeDate: "2026-02-15",
        currency: "USD",
        amount: "1000000",
        productId: product.id,
      },
    };

    const firstResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload,
    });
    const secondResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload,
    });

    assert.equal(firstResponse.statusCode, 201, firstResponse.body);
    assert.equal(secondResponse.statusCode, 200, secondResponse.body);
    assert.equal(secondResponse.json().skippedAsDuplicate, true);
    assert.equal(secondResponse.json().journalCount, 0);

    const eventRows = await db
      .select()
      .from(events)
      .where(and(eq(events.tenantId, tenant.id), eq(events.idempotencyKey, payload.event.eventId)));
    const journalRows = await db.select().from(journals).where(eq(journals.tenantId, tenant.id));
    const duplicateJournalRows = journalRows.filter((journal) => journal.sourceEventId === eventRows[0]?.id);

    assert.equal(eventRows.length, 1);
    assert.equal(duplicateJournalRows.length, 1);
  } finally {
    await app.close();
  }
  },
);

test("GET /events/:id and GET /journals endpoints return persisted rows", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const createResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-INTEGRATION-003",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });

    assert.equal(createResponse.statusCode, 201, createResponse.body);

    const persistedEventRows = await db
      .select()
      .from(events)
      .where(and(eq(events.tenantId, tenant.id), eq(events.idempotencyKey, "EVT-API-INTEGRATION-003")))
      .limit(1);
    const eventId = persistedEventRows[0].id;
    const eventFetchResponse = await app.inject({
      method: "GET",
      url: `/events/${eventId}?tenantId=${tenant.id}`,
    });

    assert.equal(eventFetchResponse.statusCode, 200);
    assert.equal(eventFetchResponse.json().eventType, "interest_accrual");
    assert.equal(eventFetchResponse.json().bookCode, "SPC_BOOK");

    const listResponse = await app.inject({
      method: "GET",
      url: `/journals?tenantId=${tenant.id}&entityId=${spcEntity.id}&from=2026-01-01&to=2026-01-31`,
    });

    assert.equal(listResponse.statusCode, 200);
    assert.equal(listResponse.json().count, 1);

    const journalId = listResponse.json().items[0].id as string;
    const journalFetchResponse = await app.inject({
      method: "GET",
      url: `/journals/${journalId}?tenantId=${tenant.id}`,
    });

    assert.equal(journalFetchResponse.statusCode, 200);
    assert.equal(journalFetchResponse.json().journalNo, "JV-202601-000001");
    assert.equal(journalFetchResponse.json().lines.length, 2);
    assert.equal(journalFetchResponse.json().lines[0].accountCode, "131000");
    assert.equal(journalFetchResponse.json().lines[1].accountCode, "411000");
  } finally {
    await app.close();
  }
});

test("GET /events and GET /ledger/trial-balance return persisted aggregates", { skip: !hasDatabaseUrl }, async () => {
  const { app, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const createResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-INTEGRATION-004",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });

    assert.equal(createResponse.statusCode, 201, createResponse.body);

    const eventsResponse = await app.inject({
      method: "GET",
      url: `/events?tenantId=${tenant.id}&entityId=${spcEntity.id}&eventType=interest_accrual&from=2026-01-01&to=2026-01-31`,
    });
    assert.equal(eventsResponse.statusCode, 200);
    assert.equal(eventsResponse.json().count, 1);
    assert.equal(eventsResponse.json().items[0].idempotencyKey, "EVT-API-INTEGRATION-004");

    const trialBalanceResponse = await app.inject({
      method: "GET",
      url: `/ledger/trial-balance?tenantId=${tenant.id}&entityId=${spcEntity.id}&asOf=2026-01-31`,
    });
    assert.equal(trialBalanceResponse.statusCode, 200);
    assert.equal(trialBalanceResponse.json().rows.length, 2);
    assert.equal(trialBalanceResponse.json().rows[0].accountCode, "131000");
    assert.equal(trialBalanceResponse.json().rows[1].accountCode, "411000");
    assert.equal(trialBalanceResponse.json().totals.debitAmount, "42000.00");
    assert.equal(trialBalanceResponse.json().totals.creditAmount, "42000.00");
  } finally {
    await app.close();
  }
});

test("GET /tenants, /entities, /products, /contracts, and /accounts return reference data", { skip: !hasDatabaseUrl }, async () => {
  const { app, tenant } = await setupIntegrationContext();

  try {
    const [tenantsResponse, entitiesResponse, productsResponse, contractsResponse, accountsResponse] = await Promise.all([
      app.inject({ method: "GET", url: "/tenants" }),
      app.inject({ method: "GET", url: `/entities?tenantId=${tenant.id}` }),
      app.inject({ method: "GET", url: `/products?tenantId=${tenant.id}` }),
      app.inject({ method: "GET", url: `/contracts?tenantId=${tenant.id}` }),
      app.inject({ method: "GET", url: `/accounts?tenantId=${tenant.id}` }),
    ]);

    assert.equal(tenantsResponse.statusCode, 200);
    assert.equal(entitiesResponse.statusCode, 200);
    assert.equal(productsResponse.statusCode, 200);
    assert.equal(contractsResponse.statusCode, 200);
    assert.equal(accountsResponse.statusCode, 200);

    assert.equal(tenantsResponse.json().count, 1);
    assert.equal(tenantsResponse.json().items[0].code, "TENANT-DEMO-001");
    assert.equal(entitiesResponse.json().count, 2);
    assert.equal(entitiesResponse.json().items[0].code, "OCEAN-FUND-I");
    assert.equal(entitiesResponse.json().items[1].code, "SPC-001");
    assert.equal(productsResponse.json().count, 1);
    assert.equal(productsResponse.json().items[0].code, "LOAN-001");
    assert.equal(contractsResponse.json().count, 1);
    assert.equal(contractsResponse.json().items[0].code, "CTR-LOAN-001");
    assert.equal(accountsResponse.json().count, 4);
    assert.equal(accountsResponse.json().items[0].code, "111000");
  } finally {
    await app.close();
  }
});

test("core accounting workflow is reviewable end-to-end", { skip: !hasDatabaseUrl }, async () => {
  const { app, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const postResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-WORKFLOW-001",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });

    assert.equal(postResponse.statusCode, 201, postResponse.body);

    const eventsResponse = await app.inject({
      method: "GET",
      url: `/events?tenantId=${tenant.id}&entityId=${spcEntity.id}&from=2026-01-01&to=2026-01-31`,
    });
    assert.equal(eventsResponse.statusCode, 200, eventsResponse.body);
    assert.equal(eventsResponse.json().count, 1);

    const sourceEventId = eventsResponse.json().items[0].id;

    const journalsResponse = await app.inject({
      method: "GET",
      url: `/journals?tenantId=${tenant.id}&entityId=${spcEntity.id}&from=2026-01-01&to=2026-01-31`,
    });
    assert.equal(journalsResponse.statusCode, 200, journalsResponse.body);
    assert.equal(journalsResponse.json().count, 1);
    assert.equal(journalsResponse.json().items[0].sourceEventId, sourceEventId);

    const journalId = journalsResponse.json().items[0].id;

    const journalDetailResponse = await app.inject({
      method: "GET",
      url: `/journals/${journalId}?tenantId=${tenant.id}`,
    });
    assert.equal(journalDetailResponse.statusCode, 200, journalDetailResponse.body);
    assert.equal(journalDetailResponse.json().lines.length, 2);
    assert.equal(journalDetailResponse.json().lines[0].accountCode, "131000");
    assert.equal(journalDetailResponse.json().lines[1].accountCode, "411000");

    const trialBalanceResponse = await app.inject({
      method: "GET",
      url: `/ledger/trial-balance?tenantId=${tenant.id}&entityId=${spcEntity.id}&asOf=2026-01-31`,
    });
    assert.equal(trialBalanceResponse.statusCode, 200, trialBalanceResponse.body);
    assert.equal(trialBalanceResponse.json().rows.length, 2);
    assert.equal(trialBalanceResponse.json().totals.debitAmount, "42000.00");
    assert.equal(trialBalanceResponse.json().totals.creditAmount, "42000.00");
  } finally {
    await app.close();
  }
});

test("financial statements endpoints return mapped aggregates", { skip: !hasDatabaseUrl }, async () => {
  const { app, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const postResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-FS-001",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });
    assert.equal(postResponse.statusCode, 201, postResponse.body);

    const [mappingsResponse, bsResponse, plResponse, cfResponse] = await Promise.all([
      app.inject({ method: "GET", url: `/statement-mappings?tenantId=${tenant.id}` }),
      app.inject({
        method: "GET",
        url: `/financial-statements/balance-sheet?tenantId=${tenant.id}&entityId=${spcEntity.id}&asOf=2026-01-31`,
      }),
      app.inject({
        method: "GET",
        url: `/financial-statements/profit-loss?tenantId=${tenant.id}&entityId=${spcEntity.id}&from=2026-01-01&to=2026-01-31`,
      }),
      app.inject({
        method: "GET",
        url: `/financial-statements/cash-flow?tenantId=${tenant.id}&entityId=${spcEntity.id}&from=2026-01-01&to=2026-01-31`,
      }),
    ]);

    assert.equal(mappingsResponse.statusCode, 200, mappingsResponse.body);
    assert.equal(mappingsResponse.json().count, 5);

    assert.equal(bsResponse.statusCode, 200, bsResponse.body);
    assert.equal(bsResponse.json().statementType, "BS");
    assert.equal(bsResponse.json().rows[0].lineCode, "ACCRUED_INTEREST");
    assert.equal(bsResponse.json().rows[0].amount, "42000.00");

    assert.equal(plResponse.statusCode, 200, plResponse.body);
    assert.equal(plResponse.json().statementType, "PL");
    assert.equal(plResponse.json().rows[0].lineCode, "INTEREST_INCOME");
    assert.equal(plResponse.json().rows[0].amount, "42000.00");

    assert.equal(cfResponse.statusCode, 200, cfResponse.body);
    assert.equal(cfResponse.json().statementType, "CF");
    assert.equal(cfResponse.json().rows.length, 0);
  } finally {
    await app.close();
  }
});

test("statement mappings can be created and updated", { skip: !hasDatabaseUrl }, async () => {
  const { app, tenant } = await setupIntegrationContext();

  try {
    const accountsResponse = await app.inject({
      method: "GET",
      url: `/accounts?tenantId=${tenant.id}`,
    });

    assert.equal(accountsResponse.statusCode, 200, accountsResponse.body);
    const accountId = accountsResponse.json().items[0]?.id;
    assert.ok(accountId);

    const createResponse = await app.inject({
      method: "POST",
      url: "/statement-mappings",
      payload: {
        tenantId: tenant.id,
        accountId,
        statementType: "BS",
        lineCode: "CASH_EQUIVALENTS",
        lineName: "Cash Equivalents",
        displayOrder: 5,
      },
    });

    assert.equal(createResponse.statusCode, 201, createResponse.body);
    assert.equal(createResponse.json().lineCode, "CASH_EQUIVALENTS");

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/statement-mappings/${createResponse.json().id}?tenantId=${tenant.id}`,
      payload: {
        lineName: "Cash and Cash Equivalents",
        displayOrder: 6,
      },
    });

    assert.equal(updateResponse.statusCode, 200, updateResponse.body);
    assert.equal(updateResponse.json().lineName, "Cash and Cash Equivalents");
    assert.equal(updateResponse.json().displayOrder, 6);
  } finally {
    await app.close();
  }
});

test("close periods can be created and listed", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity } = await setupIntegrationContext();

  try {
    const bookRows = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.tenantId, tenant.id), eq(books.entityId, spcEntity.id)))
      .limit(1);

    const bookId = bookRows[0]?.id;
    assert.ok(bookId);

    const createResponse = await app.inject({
      method: "POST",
      url: "/close-periods",
      payload: {
        tenantId: tenant.id,
        entityId: spcEntity.id,
        bookId,
        periodType: "month",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
      },
    });

    assert.equal(createResponse.statusCode, 201, createResponse.body);
    assert.equal(createResponse.json().status, "closed");
    assert.equal(createResponse.json().bookCode, "SPC_BOOK");

    const listResponse = await app.inject({
      method: "GET",
      url: `/close-periods?tenantId=${tenant.id}&entityId=${spcEntity.id}&bookId=${bookId}`,
    });

    assert.equal(listResponse.statusCode, 200, listResponse.body);
    assert.equal(listResponse.json().count, 1);
    assert.equal(listResponse.json().items[0].periodEnd, "2026-01-31");
  } finally {
    await app.close();
  }
});

test("posting is blocked when a close period exists for the accounting date", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const bookRows = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.tenantId, tenant.id), eq(books.entityId, spcEntity.id)))
      .limit(1);

    const bookId = bookRows[0]?.id;
    assert.ok(bookId);

    const closeResponse = await app.inject({
      method: "POST",
      url: "/close-periods",
      payload: {
        tenantId: tenant.id,
        entityId: spcEntity.id,
        bookId,
        periodType: "month",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
      },
    });
    assert.equal(closeResponse.statusCode, 201, closeResponse.body);

    const postResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-CLOSED-002",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });

    assert.equal(postResponse.statusCode, 409, postResponse.body);
    assert.equal(postResponse.json().error, "closed_period");

    const blockedEventRows = await db
      .select()
      .from(events)
      .where(and(eq(events.tenantId, tenant.id), eq(events.idempotencyKey, "EVT-API-CLOSED-002")));

    assert.equal(blockedEventRows.length, 0);
  } finally {
    await app.close();
  }
});

test("close period status lifecycle transitions and reopening unblocks posting", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const bookRows = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.tenantId, tenant.id), eq(books.entityId, spcEntity.id)))
      .limit(1);

    const bookId = bookRows[0]?.id;
    assert.ok(bookId);

    const createResponse = await app.inject({
      method: "POST",
      url: "/close-periods",
      payload: {
        tenantId: tenant.id,
        entityId: spcEntity.id,
        bookId,
        periodType: "month",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
        status: "open",
      },
    });

    assert.equal(createResponse.statusCode, 201, createResponse.body);
    const closePeriodId = createResponse.json().id as string;
    assert.equal(createResponse.json().status, "open");

    const closingResponse = await app.inject({
      method: "PATCH",
      url: `/close-periods/${closePeriodId}/status?tenantId=${tenant.id}`,
      payload: {
        status: "closing",
      },
    });
    assert.equal(closingResponse.statusCode, 200, closingResponse.body);
    assert.equal(closingResponse.json().status, "closing");

    const closedResponse = await app.inject({
      method: "PATCH",
      url: `/close-periods/${closePeriodId}/status?tenantId=${tenant.id}`,
      payload: {
        status: "closed",
      },
    });
    assert.equal(closedResponse.statusCode, 200, closedResponse.body);
    assert.equal(closedResponse.json().status, "closed");

    const blockedPostResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-REOPEN-BLOCKED-001",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });
    assert.equal(blockedPostResponse.statusCode, 409, blockedPostResponse.body);

    const reopenedResponse = await app.inject({
      method: "PATCH",
      url: `/close-periods/${closePeriodId}/status?tenantId=${tenant.id}`,
      payload: {
        status: "reopened",
      },
    });
    assert.equal(reopenedResponse.statusCode, 200, reopenedResponse.body);
    assert.equal(reopenedResponse.json().status, "reopened");

    const reopenedPostResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-REOPEN-ALLOWED-001",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });
    assert.equal(reopenedPostResponse.statusCode, 201, reopenedPostResponse.body);

    const invalidTransitionResponse = await app.inject({
      method: "PATCH",
      url: `/close-periods/${closePeriodId}/status?tenantId=${tenant.id}`,
      payload: {
        status: "open",
      },
    });
    assert.equal(invalidTransitionResponse.statusCode, 409, invalidTransitionResponse.body);
    assert.equal(invalidTransitionResponse.json().error, "invalid_close_period_transition");
  } finally {
    await app.close();
  }
});

test("investor allocation APIs run and return allocation views", { skip: !hasDatabaseUrl }, async () => {
  const { app, tenant } = await setupIntegrationContext();

  try {
    const positionsResponse = await app.inject({
      method: "GET",
      url: `/investor-positions?tenantId=${tenant.id}`,
    });
    assert.equal(positionsResponse.statusCode, 200, positionsResponse.body);
    assert.equal(positionsResponse.json().count, 2);

    const fundEntityId = positionsResponse.json().items[0].fundEntityId as string;
    const alphaInvestorId = positionsResponse.json().items.find((row: { investorCode: string }) => row.investorCode === "LP-ALPHA")
      ?.investorId as string;
    assert.ok(fundEntityId);
    assert.ok(alphaInvestorId);

    const runResponse = await app.inject({
      method: "POST",
      url: "/allocations/run",
      payload: {
        tenantId: tenant.id,
        fundEntityId,
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
        method: "pro_rata",
        sourceAmount: "42000",
        cashDistributionAmount: "0",
      },
    });
    assert.equal(runResponse.statusCode, 201, runResponse.body);
    assert.equal(runResponse.json().count, 2);

    const alphaAllocation = runResponse.json().items.find(
      (row: { investorCode: string }) => row.investorCode === "LP-ALPHA",
    );
    assert.equal(alphaAllocation?.allocatedProfitAmount, "25200.00");

    const listResponse = await app.inject({
      method: "GET",
      url: `/allocations?tenantId=${tenant.id}&fundEntityId=${fundEntityId}&periodStart=2026-01-01&periodEnd=2026-01-31`,
    });
    assert.equal(listResponse.statusCode, 200, listResponse.body);
    assert.equal(listResponse.json().count, 2);

    const allocationId = listResponse.json().items[0].id as string;
    const detailResponse = await app.inject({
      method: "GET",
      url: `/allocations/${allocationId}?tenantId=${tenant.id}`,
    });
    assert.equal(detailResponse.statusCode, 200, detailResponse.body);
    assert.equal(detailResponse.json().allocationMethod, "pro_rata");

    const historyResponse = await app.inject({
      method: "GET",
      url: `/investors/${alphaInvestorId}/allocation-history?tenantId=${tenant.id}`,
    });
    assert.equal(historyResponse.statusCode, 200, historyResponse.body);
    assert.equal(historyResponse.json().count, 1);
    assert.equal(historyResponse.json().items[0].allocatedProfitAmount, "25200.00");
  } finally {
    await app.close();
  }
});

test("journal reverse creates reversal journal and marks original reversed", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const createResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-REVERSE-001",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });
    assert.equal(createResponse.statusCode, 201, createResponse.body);

    const journalsResponse = await app.inject({
      method: "GET",
      url: `/journals?tenantId=${tenant.id}&entityId=${spcEntity.id}&from=2026-01-01&to=2026-01-31`,
    });
    const originalJournalId = journalsResponse.json().items[0].id as string;

    const reverseResponse = await app.inject({
      method: "POST",
      url: `/journals/${originalJournalId}/reverse?tenantId=${tenant.id}`,
      payload: {},
    });
    assert.equal(reverseResponse.statusCode, 200, reverseResponse.body);

    const originalRows = await db
      .select()
      .from(journals)
      .where(and(eq(journals.tenantId, tenant.id), eq(journals.id, originalJournalId)))
      .limit(1);
    assert.equal(originalRows[0]?.postingStatus, "reversed");

    const reversalRows = await db
      .select()
      .from(journals)
      .where(and(eq(journals.tenantId, tenant.id), eq(journals.id, reverseResponse.json().reversalJournalId)))
      .limit(1);
    assert.equal(reversalRows[0]?.journalType, "reversal");
    assert.equal(reversalRows[0]?.postingStatus, "posted");
  } finally {
    await app.close();
  }
});

test("event reprocess reverses active journals and generates replacement journals", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity, product, contract } = await setupIntegrationContext();

  try {
    const createResponse = await app.inject({
      method: "POST",
      url: "/accounting-events",
      payload: {
        tenantId: tenant.id,
        accountingBasis: "KGAAP_GENERAL",
        baseCurrency: "USD",
        event: {
          eventId: "EVT-API-REPROCESS-001",
          eventType: "interest_accrual",
          entityId: spcEntity.id,
          bookCode: "SPC_BOOK",
          accountingDate: "2026-01-31",
          tradeDate: "2026-01-31",
          currency: "USD",
          amount: "42000",
          productId: product.id,
          contractId: contract.id,
        },
      },
    });
    assert.equal(createResponse.statusCode, 201, createResponse.body);

    const eventRows = await db
      .select()
      .from(events)
      .where(and(eq(events.tenantId, tenant.id), eq(events.idempotencyKey, "EVT-API-REPROCESS-001")))
      .limit(1);
    const persistedEventId = eventRows[0].id;

    const reprocessResponse = await app.inject({
      method: "POST",
      url: `/events/${persistedEventId}/reprocess?tenantId=${tenant.id}`,
      payload: {},
    });
    assert.equal(reprocessResponse.statusCode, 200, reprocessResponse.body);
    assert.equal(reprocessResponse.json().reversedJournalCount, 1);
    assert.equal(reprocessResponse.json().newJournalCount, 1);

    const eventJournalRows = await db
      .select()
      .from(journals)
      .where(and(eq(journals.tenantId, tenant.id), eq(journals.sourceEventId, persistedEventId)));

    const autoOrReprocessRows = eventJournalRows.filter((row) => row.journalType === "auto" || row.journalType === "reprocess");
    const reversalRows = eventJournalRows.filter((row) => row.journalType === "reversal");
    assert.equal(autoOrReprocessRows.length, 2);
    assert.equal(reversalRows.length, 1);
    assert.ok(autoOrReprocessRows.some((row) => row.postingStatus === "reversed"));
    assert.ok(autoOrReprocessRows.some((row) => row.journalType === "reprocess" && row.postingStatus === "posted"));
  } finally {
    await app.close();
  }
});

test("manual journal creates a posted standalone journal", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity } = await setupIntegrationContext();

  try {
    const response = await app.inject({
      method: "POST",
      url: "/journals/manual",
      payload: {
        tenantId: tenant.id,
        entityId: spcEntity.id,
        bookCode: "SPC_BOOK",
        accountingDate: "2026-01-31",
        description: "Manual adjustment",
        lines: [
          {
            accountCode: "131000",
            side: "debit",
            amount: "100.00",
            currency: "USD",
          },
          {
            accountCode: "411000",
            side: "credit",
            amount: "100.00",
            currency: "USD",
          },
        ],
      },
    });

    assert.equal(response.statusCode, 201, response.body);
    const journalId = response.json().journalId as string;

    const journalRows = await db
      .select()
      .from(journals)
      .where(and(eq(journals.tenantId, tenant.id), eq(journals.id, journalId)))
      .limit(1);
    assert.equal(journalRows[0]?.journalType, "manual");
    assert.equal(journalRows[0]?.sourceEventId, null);
    assert.equal(journalRows[0]?.postingStatus, "posted");

    const lineRows = await db
      .select()
      .from(journalLines)
      .where(and(eq(journalLines.tenantId, tenant.id), eq(journalLines.journalId, journalId)));
    assert.equal(lineRows.length, 2);
  } finally {
    await app.close();
  }
});

test("journal approve moves a draft journal to approved and records audit log", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity } = await setupIntegrationContext();

  try {
    const bookRows = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.tenantId, tenant.id), eq(books.entityId, spcEntity.id), eq(books.code, "SPC_BOOK")))
      .limit(1);

    const inserted = await db
      .insert(journals)
      .values({
        tenantId: tenant.id,
        entityId: spcEntity.id,
        bookId: bookRows[0].id,
        sourceEventId: null,
        journalNo: "JV-202601-999998",
        journalType: "manual",
        accountingDate: "2026-01-31",
        postingStatus: "draft",
        description: "Draft journal awaiting approval",
      })
      .returning({ id: journals.id });

    const response = await app.inject({
      method: "POST",
      url: `/journals/${inserted[0].id}/approve?tenantId=${tenant.id}`,
      payload: {},
    });

    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().postingStatus, "approved");

    const journalRows = await db
      .select({
        postingStatus: journals.postingStatus,
        approvedBy: journals.approvedBy,
      })
      .from(journals)
      .where(and(eq(journals.tenantId, tenant.id), eq(journals.id, inserted[0].id)))
      .limit(1);

    assert.equal(journalRows[0]?.postingStatus, "approved");
    assert.equal(journalRows[0]?.approvedBy, null);

    const auditRows = await db
      .select({
        actionType: auditLogs.actionType,
        resourceId: auditLogs.resourceId,
      })
      .from(auditLogs)
      .where(and(eq(auditLogs.tenantId, tenant.id), eq(auditLogs.resourceId, inserted[0].id)));

    assert.ok(auditRows.some((row) => row.actionType === "approve_journal"));
  } finally {
    await app.close();
  }
});

test("journal approve rejects non-draft journals", { skip: !hasDatabaseUrl }, async () => {
  const { app, db, tenant, spcEntity } = await setupIntegrationContext();

  try {
    const bookRows = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.tenantId, tenant.id), eq(books.entityId, spcEntity.id), eq(books.code, "SPC_BOOK")))
      .limit(1);

    const inserted = await db
      .insert(journals)
      .values({
        tenantId: tenant.id,
        entityId: spcEntity.id,
        bookId: bookRows[0].id,
        sourceEventId: null,
        journalNo: "JV-202601-999997",
        journalType: "manual",
        accountingDate: "2026-01-31",
        postingStatus: "posted",
        description: "Posted journal",
      })
      .returning({ id: journals.id });

    const response = await app.inject({
      method: "POST",
      url: `/journals/${inserted[0].id}/approve?tenantId=${tenant.id}`,
      payload: {},
    });

    assert.equal(response.statusCode, 409, response.body);
    assert.equal(response.json().error, "invalid_journal_transition");
  } finally {
    await app.close();
  }
});

test("audit log API returns operation history", { skip: !hasDatabaseUrl }, async () => {
  const { app, tenant, spcEntity } = await setupIntegrationContext();

  try {
    const manualResponse = await app.inject({
      method: "POST",
      url: "/journals/manual",
      payload: {
        tenantId: tenant.id,
        entityId: spcEntity.id,
        bookCode: "SPC_BOOK",
        accountingDate: "2026-01-31",
        description: "Manual adjustment",
        lines: [
          {
            accountCode: "131000",
            side: "debit",
            amount: "100.00",
            currency: "USD",
          },
          {
            accountCode: "411000",
            side: "credit",
            amount: "100.00",
            currency: "USD",
          },
        ],
      },
    });
    assert.equal(manualResponse.statusCode, 201, manualResponse.body);

    const auditResponse = await app.inject({
      method: "GET",
      url: `/audit-logs?tenantId=${tenant.id}`,
    });
    assert.equal(auditResponse.statusCode, 200, auditResponse.body);
    assert.ok(auditResponse.json().count >= 1);
    assert.ok(
      auditResponse.json().items.some(
        (row: { actionType: string; resourceType: string }) =>
          row.actionType === "create_manual_journal" && row.resourceType === "journal",
      ),
    );
  } finally {
    await app.close();
  }
});
