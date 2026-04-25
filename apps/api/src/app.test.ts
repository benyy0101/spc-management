import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "./app";

const makeDeps = (
  overrides: Partial<Parameters<typeof buildApp>[0]> = {},
): Parameters<typeof buildApp>[0] => ({
  postAccountingEvent: async () => {
    throw new Error("should not be called");
  },
  listTenants: async () => [],
  listEntities: async () => [],
  listAccounts: async () => [],
  listProducts: async () => [],
  listContracts: async () => [],
  listEvents: async () => [],
  getEventById: async () => null,
  getJournalById: async () => null,
  listJournals: async () => [],
  getTrialBalance: async () => ({
    tenantId: "TENANT-1",
    asOf: "2026-01-31",
    rows: [],
    totals: { debitAmount: "0.00", creditAmount: "0.00" },
  }),
  ...overrides,
});

test("GET /health returns ok", async () => {
  const app = buildApp(makeDeps());

  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
  await app.close();
});

test("POST /accounting-events returns created journals", async () => {
  const app = buildApp(makeDeps({
    postAccountingEvent: async (command) => ({
      eventId: command.event.eventId,
      journalCount: 1,
      skippedAsDuplicate: false,
      journals: [
        {
          entityId: command.event.entityId,
          bookCode: command.event.bookCode,
          journalType: "auto",
          accountingDate: command.event.accountingDate,
          lines: [
            {
              accountCode: "131000",
              side: "debit",
              amount: command.event.amount,
              currency: command.event.currency,
            },
            {
              accountCode: "411000",
              side: "credit",
              amount: command.event.amount,
              currency: command.event.currency,
            },
          ],
        },
      ],
    }),
  }));

  const response = await app.inject({
    method: "POST",
    url: "/accounting-events",
    payload: {
      tenantId: "2e446b91-7ef6-4d3d-aaf3-f23b7bb87b1f",
      accountingBasis: "KGAAP_GENERAL",
      baseCurrency: "USD",
      event: {
        eventId: "EVT-API-001",
        eventType: "interest_accrual",
        entityId: "2a48dc3d-b737-4b84-a9a0-7fc1b7206cdf",
        bookCode: "SPC_BOOK",
        accountingDate: "2026-01-31",
        currency: "USD",
        amount: "42000",
      },
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().journalCount, 1);
  await app.close();
});

test("POST /accounting-events validates payload", async () => {
  const app = buildApp(makeDeps());

  const response = await app.inject({
    method: "POST",
    url: "/accounting-events",
    payload: {
      tenantId: "TENANT-DEMO-001",
    },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error, "Bad Request");
  await app.close();
});

test("GET /events/:id returns event", async () => {
  const app = buildApp(makeDeps({
    getEventById: async (_tenantId, eventId) => ({
      id: eventId,
      tenantId: "TENANT-1",
      entityId: "ENTITY-1",
      entityCode: "SPC-001",
      bookId: "BOOK-1",
      bookCode: "SPC_BOOK",
      eventType: "interest_accrual",
      idempotencyKey: "EVT-001",
      status: "posted",
      tradeDate: "2026-01-31",
      accountingDate: "2026-01-31",
      settlementDate: null,
      currency: "USD",
      amount: "42000",
      productId: null,
      contractId: null,
      counterpartyEntityId: null,
      investorId: null,
      sourceReference: null,
      payload: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  }));

  const response = await app.inject({
    method: "GET",
    url: "/events/EVENT-1?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, "EVENT-1");
  await app.close();
});

test("GET /journals returns items", async () => {
  const app = buildApp(makeDeps({
    listJournals: async () => [
      {
        id: "JOURNAL-1",
        tenantId: "TENANT-1",
        entityId: "ENTITY-1",
        entityCode: "SPC-001",
        bookId: "BOOK-1",
        bookCode: "SPC_BOOK",
        sourceEventId: "EVENT-1",
        journalNo: "JV-202601-000001",
        journalType: "auto",
        accountingDate: "2026-01-31",
        postingStatus: "posted",
        description: "Interest accrual",
        postedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  }));

  const response = await app.inject({
    method: "GET",
    url: "/journals?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].journalNo, "JV-202601-000001");
  await app.close();
});

test("GET /events returns items", async () => {
  const app = buildApp(makeDeps({
    listEvents: async () => [
      {
        id: "EVENT-1",
        tenantId: "TENANT-1",
        entityId: "ENTITY-1",
        entityCode: "SPC-001",
        bookId: "BOOK-1",
        bookCode: "SPC_BOOK",
        eventType: "interest_accrual",
        idempotencyKey: "EVT-001",
        status: "posted",
        tradeDate: "2026-01-31",
        accountingDate: "2026-01-31",
        settlementDate: null,
        currency: "USD",
        amount: "42000",
        productId: null,
        contractId: null,
        counterpartyEntityId: null,
        investorId: null,
        sourceReference: null,
        payload: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  }));

  const response = await app.inject({
    method: "GET",
    url: "/events?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].eventType, "interest_accrual");
  await app.close();
});

test("GET /ledger/trial-balance returns summary", async () => {
  const app = buildApp(makeDeps({
    getTrialBalance: async () => ({
      tenantId: "TENANT-1",
      asOf: "2026-01-31",
      rows: [
        {
          accountId: "ACCOUNT-1",
          accountCode: "131000",
          accountName: "Accrued Interest Receivable",
          statementType: "BS",
          debitAmount: "42000.00",
          creditAmount: "0.00",
          balanceAmount: "42000.00",
          normalBalance: "debit",
        },
      ],
      totals: {
        debitAmount: "42000.00",
        creditAmount: "42000.00",
      },
    }),
  }));

  const response = await app.inject({
    method: "GET",
    url: "/ledger/trial-balance?tenantId=TENANT-1&asOf=2026-01-31",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().rows[0].accountCode, "131000");
  assert.equal(response.json().totals.debitAmount, "42000.00");
  await app.close();
});

test("GET /docs returns swagger ui", async () => {
  const app = buildApp(makeDeps());

  await app.ready();
  const response = await app.inject({
    method: "GET",
    url: "/docs",
  });

  assert.equal(response.statusCode, 200);
  await app.close();
});

test("GET /entities returns items", async () => {
  const app = buildApp(
    makeDeps({
      listEntities: async () => [
        {
          id: "ENTITY-1",
          tenantId: "TENANT-1",
          code: "SPC-001",
          name: "Demo SPC",
          entityType: "spc",
          functionalCurrency: "USD",
          status: "active",
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/entities?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].code, "SPC-001");
  await app.close();
});

test("GET /tenants returns items", async () => {
  const app = buildApp(
    makeDeps({
      listTenants: async () => [
        {
          id: "TENANT-1",
          code: "TENANT-DEMO-001",
          name: "Demo Tenant",
          status: "active",
          baseCurrency: "USD",
          accountingTimezone: "Asia/Seoul",
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/tenants",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].code, "TENANT-DEMO-001");
  await app.close();
});

test("GET /products returns items", async () => {
  const app = buildApp(
    makeDeps({
      listProducts: async () => [
        {
          id: "PRODUCT-1",
          tenantId: "TENANT-1",
          code: "LOAN-001",
          name: "Demo Loan",
          productType: "loan_receivable",
          currency: "USD",
          status: "active",
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/products?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().items[0].code, "LOAN-001");
  await app.close();
});

test("GET /contracts returns items", async () => {
  const app = buildApp(
    makeDeps({
      listContracts: async () => [
        {
          id: "CONTRACT-1",
          tenantId: "TENANT-1",
          productId: "PRODUCT-1",
          productCode: "LOAN-001",
          code: "CTR-LOAN-001",
          contractType: "loan_agreement",
          currency: "USD",
          effectiveDate: "2026-01-01",
          maturityDate: "2028-12-31",
          interestRateType: "fixed",
          interestRate: "0.085",
          dayCountConvention: "ACT_360",
          versionNo: 1,
          status: "active",
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/contracts?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().items[0].code, "CTR-LOAN-001");
  await app.close();
});

test("GET /accounts returns items", async () => {
  const app = buildApp(
    makeDeps({
      listAccounts: async () => [
        {
          id: "ACCOUNT-1",
          tenantId: "TENANT-1",
          code: "131000",
          name: "Accrued Interest Receivable",
          accountType: "asset",
          statementType: "BS",
          normalBalance: "debit",
          isActive: true,
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/accounts?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().items[0].code, "131000");
  await app.close();
});
