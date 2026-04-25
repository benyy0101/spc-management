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
  journalLines,
  journals,
  products,
  tenants,
} from "@spc/db";
import { buildApp } from "./app";
import { createDrizzleAccountingReadRepository } from "./adapters/drizzle-accounting-read-repository";
import { createDrizzleAccountingEventRepository, createDrizzleAuditLogPort } from "./adapters/drizzle-accounting-event-repository";

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

  await db.insert(books).values({
    tenantId: tenant.id,
    entityId: spcEntity.id,
    code: "SPC_BOOK",
    name: "SPC Book",
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

  return {
    tenant,
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
    listAccounts: (tenantId) => accountingReadRepository.listAccounts(tenantId),
    listProducts: (tenantId) => accountingReadRepository.listProducts(tenantId),
    listContracts: (tenantId) => accountingReadRepository.listContracts(tenantId),
    listEvents: (filters) => accountingReadRepository.listEvents(filters),
    getEventById: (tenantId, eventId) => accountingReadRepository.getEventById(tenantId, eventId),
    getJournalById: (tenantId, journalId) => accountingReadRepository.getJournalById(tenantId, journalId),
    listJournals: (filters) => accountingReadRepository.listJournals(filters),
    getTrialBalance: (filters) => accountingReadRepository.getTrialBalance(filters),
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
    assert.equal(entitiesResponse.json().count, 1);
    assert.equal(entitiesResponse.json().items[0].code, "SPC-001");
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
