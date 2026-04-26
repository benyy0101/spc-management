import assert from "node:assert/strict";
import test from "node:test";
import { InvalidClosePeriodTransitionError, InvalidJournalApprovalError } from "./errors";
import { buildApp } from "./app";

const makeDeps = (
  overrides: Partial<Parameters<typeof buildApp>[0]> = {},
): Parameters<typeof buildApp>[0] => ({
  postAccountingEvent: async () => {
    throw new Error("should not be called");
  },
  listTenants: async () => [],
  listEntities: async () => [],
  createEntity: async (input) => ({
    id: "ENTITY-NEW",
    tenantId: input.tenantId,
    code: input.code,
    name: input.name,
    entityType: input.entityType,
    functionalCurrency: input.functionalCurrency,
    status: input.status ?? "active",
  }),
  updateEntity: async (_tenantId, entityId, input) => ({
    id: entityId,
    tenantId: "TENANT-1",
    code: input.code ?? "SPC-001",
    name: input.name ?? "SPC 001",
    entityType: input.entityType ?? "spc",
    functionalCurrency: input.functionalCurrency ?? "USD",
    status: input.status ?? "active",
  }),
  listAccounts: async () => [],
  listStatementMappings: async () => [],
  createStatementMapping: async (input) => ({
    id: "MAP-1",
    tenantId: input.tenantId,
    accountId: input.accountId,
    accountCode: "111000",
    accountName: "Cash",
    statementType: input.statementType,
    lineCode: input.lineCode,
    lineName: input.lineName,
    displayOrder: input.displayOrder,
  }),
  updateStatementMapping: async (_tenantId, mappingId, input) => ({
    id: mappingId,
    tenantId: "TENANT-1",
    accountId: "ACCOUNT-1",
    accountCode: "111000",
    accountName: "Cash",
    statementType: "BS",
    lineCode: input.lineCode ?? "CASH",
    lineName: input.lineName ?? "Cash",
    displayOrder: input.displayOrder ?? 10,
  }),
  listClosePeriods: async () => [],
  createClosePeriod: async (input) => ({
    id: "CLOSE-1",
    tenantId: input.tenantId,
    entityId: input.entityId,
    entityCode: "SPC-001",
    bookId: input.bookId,
    bookCode: "SPC_BOOK",
    periodType: input.periodType,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    status: input.status ?? "closed",
    closedAt: input.status === "open" ? null : new Date().toISOString(),
    closedBy: input.closedBy ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  updateClosePeriodStatus: async (_tenantId, closePeriodId, input) => ({
    id: closePeriodId,
    tenantId: "TENANT-1",
    entityId: "ENTITY-1",
    entityCode: "SPC-001",
    bookId: "BOOK-1",
    bookCode: "SPC_BOOK",
    periodType: "month",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    status: input.status,
    closedAt: input.status === "closed" ? new Date().toISOString() : null,
    closedBy: input.status === "closed" ? (input.closedBy ?? null) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  listInvestorPositions: async () => [],
  runAllocations: async () => [],
  listAllocations: async () => [],
  getAllocationById: async () => null,
  getInvestorAllocationHistory: async () => [],
  reverseJournal: async () => null,
  reprocessEvent: async () => null,
  createManualJournal: async () => ({
    journalId: "MANUAL-1",
    journalNo: "JV-202601-000010",
    accountingDate: "2026-01-31",
    lineCount: 2,
  }),
  approveJournal: async () => null,
  listAuditLogs: async () => [],
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
  getBalanceSheet: async () => ({
    tenantId: "TENANT-1",
    statementType: "BS",
    asOf: "2026-01-31",
    rows: [],
    totals: { amount: "0.00" },
  }),
  getProfitLoss: async () => ({
    tenantId: "TENANT-1",
    statementType: "PL",
    from: "2026-01-01",
    to: "2026-01-31",
    rows: [],
    totals: { amount: "0.00" },
  }),
  getCashFlow: async () => ({
    tenantId: "TENANT-1",
    statementType: "CF",
    from: "2026-01-01",
    to: "2026-01-31",
    rows: [],
    totals: { amount: "0.00" },
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

test("POST /accounting-events returns 409 for closed period", async () => {
  const app = buildApp(
    makeDeps({
      postAccountingEvent: async () => {
        throw new Error("should be overridden");
      },
    }),
  );

  const closingApp = buildApp(
    makeDeps({
      postAccountingEvent: async () => {
        const { ClosedPeriodError } = await import("@spc/application");
        throw new ClosedPeriodError("Accounting period is closed for 2026-01-31");
      },
    }),
  );

  const response = await closingApp.inject({
    method: "POST",
    url: "/accounting-events",
    payload: {
      tenantId: "2e446b91-7ef6-4d3d-aaf3-f23b7bb87b1f",
      accountingBasis: "KGAAP_GENERAL",
      baseCurrency: "USD",
      event: {
        eventId: "EVT-API-CLOSED-001",
        eventType: "interest_accrual",
        entityId: "2a48dc3d-b737-4b84-a9a0-7fc1b7206cdf",
        bookCode: "SPC_BOOK",
        accountingDate: "2026-01-31",
        currency: "USD",
        amount: "42000",
      },
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(response.json().error, "closed_period");
  await app.close();
  await closingApp.close();
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

test("GET /statement-mappings returns items", async () => {
  const app = buildApp(
    makeDeps({
      listStatementMappings: async () => [
        {
          id: "MAP-1",
          tenantId: "TENANT-1",
          accountId: "ACCOUNT-1",
          accountCode: "131000",
          accountName: "Accrued Interest Receivable",
          statementType: "BS",
          lineCode: "ACCRUED_INTEREST",
          lineName: "Accrued Interest",
          displayOrder: 10,
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/statement-mappings?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().items[0].lineCode, "ACCRUED_INTEREST");
  await app.close();
});

test("POST /statement-mappings returns created mapping", async () => {
  const app = buildApp(makeDeps());

  const response = await app.inject({
    method: "POST",
    url: "/statement-mappings",
    payload: {
      tenantId: "TENANT-1",
      accountId: "ACCOUNT-1",
      statementType: "BS",
      lineCode: "ACCRUED_INTEREST",
      lineName: "Accrued Interest",
      displayOrder: 10,
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().id, "MAP-1");
  assert.equal(response.json().lineCode, "ACCRUED_INTEREST");
  await app.close();
});

test("PATCH /statement-mappings/:id returns updated mapping", async () => {
  const app = buildApp(makeDeps());

  const response = await app.inject({
    method: "PATCH",
    url: "/statement-mappings/MAP-1?tenantId=TENANT-1",
    payload: {
      lineCode: "UPDATED_LINE",
      lineName: "Updated Line",
      displayOrder: 20,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, "MAP-1");
  assert.equal(response.json().lineCode, "UPDATED_LINE");
  assert.equal(response.json().displayOrder, 20);
  await app.close();
});

test("GET /close-periods returns items", async () => {
  const app = buildApp(
    makeDeps({
      listClosePeriods: async () => [
        {
          id: "CLOSE-1",
          tenantId: "TENANT-1",
          entityId: "ENTITY-1",
          entityCode: "SPC-001",
          bookId: "BOOK-1",
          bookCode: "SPC_BOOK",
          periodType: "month",
          periodStart: "2026-01-01",
          periodEnd: "2026-01-31",
          status: "closed",
          closedAt: "2026-02-01T00:00:00.000Z",
          closedBy: null,
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/close-periods?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].status, "closed");
  await app.close();
});

test("POST /close-periods returns created close period", async () => {
  const app = buildApp(makeDeps());

  const response = await app.inject({
    method: "POST",
    url: "/close-periods",
    payload: {
      tenantId: "TENANT-1",
      entityId: "ENTITY-1",
      bookId: "BOOK-1",
      periodType: "month",
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().id, "CLOSE-1");
  assert.equal(response.json().status, "closed");
  await app.close();
});

test("PATCH /close-periods/:id/status returns updated close period", async () => {
  const app = buildApp(makeDeps());

  const response = await app.inject({
    method: "PATCH",
    url: "/close-periods/CLOSE-1/status?tenantId=TENANT-1",
    payload: {
      status: "reopened",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().id, "CLOSE-1");
  assert.equal(response.json().status, "reopened");
  await app.close();
});

test("PATCH /close-periods/:id/status returns 409 for invalid transition", async () => {
  const app = buildApp(
    makeDeps({
      updateClosePeriodStatus: async () => {
        throw new InvalidClosePeriodTransitionError("Cannot transition close period from open to reopened");
      },
    }),
  );

  const response = await app.inject({
    method: "PATCH",
    url: "/close-periods/CLOSE-1/status?tenantId=TENANT-1",
    payload: {
      status: "reopened",
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(response.json().error, "invalid_close_period_transition");
  await app.close();
});

test("GET /investor-positions returns items", async () => {
  const app = buildApp(
    makeDeps({
      listInvestorPositions: async () => [
        {
          id: "POS-1",
          tenantId: "TENANT-1",
          fundEntityId: "FUND-1",
          fundEntityCode: "OCEAN-FUND-I",
          investorId: "INV-1",
          investorCode: "LP-ALPHA",
          investorName: "Alpha Pension Fund",
          ownershipRatio: "0.60000000",
          commitmentAmount: "0.00",
          paidInAmount: "0.00",
          effectiveFrom: "2026-01-01",
          effectiveTo: null,
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/investor-positions?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].investorCode, "LP-ALPHA");
  await app.close();
});

test("POST /allocations/run returns allocation rows", async () => {
  const app = buildApp(
    makeDeps({
      runAllocations: async () => [
        {
          id: "ALLOC-1",
          tenantId: "TENANT-1",
          fundEntityId: "FUND-1",
          fundEntityCode: "OCEAN-FUND-I",
          investorId: "INV-1",
          investorCode: "LP-ALPHA",
          investorName: "Alpha Pension Fund",
          periodStart: "2026-01-01",
          periodEnd: "2026-01-31",
          allocationMethod: "pro_rata",
          sourceAmountType: "profit",
          sourceAmount: "42000.00",
          ownershipRatio: "0.60000000",
          allocatedProfitAmount: "25200.00",
          cashDistributionAmount: "0.00",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "POST",
    url: "/allocations/run",
    payload: {
      tenantId: "TENANT-1",
      fundEntityId: "FUND-1",
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      method: "pro_rata",
      sourceAmount: "42000",
      cashDistributionAmount: "0",
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].allocatedProfitAmount, "25200.00");
  await app.close();
});

test("GET /allocations and allocation history return rows", async () => {
  const allocationRow = {
    id: "ALLOC-1",
    tenantId: "TENANT-1",
    fundEntityId: "FUND-1",
    fundEntityCode: "OCEAN-FUND-I",
    investorId: "INV-1",
    investorCode: "LP-ALPHA",
    investorName: "Alpha Pension Fund",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    allocationMethod: "pro_rata",
    sourceAmountType: "profit",
    sourceAmount: "42000.00",
    ownershipRatio: "0.60000000",
    allocatedProfitAmount: "25200.00",
    cashDistributionAmount: "0.00",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const app = buildApp(
    makeDeps({
      listAllocations: async () => [allocationRow],
      getAllocationById: async () => allocationRow,
      getInvestorAllocationHistory: async () => [allocationRow],
    }),
  );

  const [listResponse, detailResponse, historyResponse] = await Promise.all([
    app.inject({ method: "GET", url: "/allocations?tenantId=TENANT-1" }),
    app.inject({ method: "GET", url: "/allocations/ALLOC-1?tenantId=TENANT-1" }),
    app.inject({ method: "GET", url: "/investors/INV-1/allocation-history?tenantId=TENANT-1" }),
  ]);

  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json().count, 1);
  assert.equal(detailResponse.statusCode, 200);
  assert.equal(detailResponse.json().id, "ALLOC-1");
  assert.equal(historyResponse.statusCode, 200);
  assert.equal(historyResponse.json().count, 1);
  await app.close();
});

test("POST /journals/:id/reverse returns reversal result", async () => {
  const app = buildApp(
    makeDeps({
      reverseJournal: async () => ({
        originalJournalId: "JOURNAL-1",
        originalJournalNo: "JV-202601-000001",
        reversalJournalId: "JOURNAL-2",
        reversalJournalNo: "JV-202601-000002",
        accountingDate: "2026-01-31",
      }),
    }),
  );

  const response = await app.inject({
    method: "POST",
    url: "/journals/JOURNAL-1/reverse?tenantId=TENANT-1",
    payload: {},
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().reversalJournalNo, "JV-202601-000002");
  await app.close();
});

test("POST /events/:id/reprocess returns regenerated journals", async () => {
  const app = buildApp(
    makeDeps({
      reprocessEvent: async () => ({
        eventId: "EVENT-1",
        reversedJournalCount: 1,
        newJournalCount: 1,
        journalNos: ["JV-202601-000003"],
      }),
    }),
  );

  const response = await app.inject({
    method: "POST",
    url: "/events/EVENT-1/reprocess?tenantId=TENANT-1",
    payload: {},
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().newJournalCount, 1);
  assert.equal(response.json().journalNos[0], "JV-202601-000003");
  await app.close();
});

test("POST /journals/manual returns created manual journal", async () => {
  const app = buildApp(makeDeps());

  const response = await app.inject({
    method: "POST",
    url: "/journals/manual",
    payload: {
      tenantId: "TENANT-1",
      entityId: "ENTITY-1",
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

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().journalNo, "JV-202601-000010");
  assert.equal(response.json().lineCount, 2);
  await app.close();
});

test("POST /journals/:id/approve approves a draft journal", async () => {
  const app = buildApp(
    makeDeps({
      approveJournal: async (input) => ({
        journalId: input.journalId,
        journalNo: "JV-202601-000020",
        postingStatus: "approved",
        approvedBy: input.actorUserId ?? null,
      }),
    }),
  );

  const response = await app.inject({
    method: "POST",
    url: "/journals/JNL-1/approve?tenantId=TENANT-1",
    payload: {
      actorUserId: "USER-1",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    journalId: "JNL-1",
    journalNo: "JV-202601-000020",
    postingStatus: "approved",
    approvedBy: "USER-1",
  });
  await app.close();
});

test("POST /journals/:id/approve returns 409 for invalid transition", async () => {
  const app = buildApp(
    makeDeps({
      approveJournal: async () => {
        throw new InvalidJournalApprovalError("Cannot approve journal JV-202601-000020 from status posted");
      },
    }),
  );

  const response = await app.inject({
    method: "POST",
    url: "/journals/JNL-1/approve?tenantId=TENANT-1",
    payload: {},
  });

  assert.equal(response.statusCode, 409);
  assert.equal(response.json().error, "invalid_journal_transition");
  await app.close();
});

test("GET /audit-logs returns items", async () => {
  const app = buildApp(
    makeDeps({
      listAuditLogs: async () => [
        {
          id: "AUDIT-1",
          tenantId: "TENANT-1",
          actorUserId: null,
          actionType: "post_accounting_event",
          resourceType: "event",
          resourceId: "EVENT-1",
          beforePayload: null,
          afterPayload: { journalCount: 1 },
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/audit-logs?tenantId=TENANT-1",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, 1);
  assert.equal(response.json().items[0].actionType, "post_accounting_event");
  await app.close();
});

test("GET /financial-statements/balance-sheet returns statement", async () => {
  const app = buildApp(
    makeDeps({
      getBalanceSheet: async () => ({
        tenantId: "TENANT-1",
        entityId: "ENTITY-1",
        statementType: "BS",
        asOf: "2026-01-31",
        rows: [
          {
            lineCode: "ACCRUED_INTEREST",
            lineName: "Accrued Interest",
            statementType: "BS",
            amount: "42000.00",
            displayOrder: 10,
          },
        ],
        totals: { amount: "42000.00" },
      }),
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/financial-statements/balance-sheet?tenantId=TENANT-1&entityId=ENTITY-1&asOf=2026-01-31",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().rows[0].lineCode, "ACCRUED_INTEREST");
  await app.close();
});

test("GET /financial-statements/profit-loss returns statement", async () => {
  const app = buildApp(
    makeDeps({
      getProfitLoss: async () => ({
        tenantId: "TENANT-1",
        entityId: "ENTITY-1",
        statementType: "PL",
        from: "2026-01-01",
        to: "2026-01-31",
        rows: [
          {
            lineCode: "INTEREST_INCOME",
            lineName: "Interest Income",
            statementType: "PL",
            amount: "42000.00",
            displayOrder: 10,
          },
        ],
        totals: { amount: "42000.00" },
      }),
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/financial-statements/profit-loss?tenantId=TENANT-1&entityId=ENTITY-1&from=2026-01-01&to=2026-01-31",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().statementType, "PL");
  await app.close();
});

test("GET /financial-statements/cash-flow returns statement", async () => {
  const app = buildApp(
    makeDeps({
      getCashFlow: async () => ({
        tenantId: "TENANT-1",
        entityId: "ENTITY-1",
        statementType: "CF",
        from: "2026-01-01",
        to: "2026-01-31",
        rows: [
          {
            lineCode: "OPERATING_CASH",
            lineName: "Operating Cash Flow",
            statementType: "CF",
            amount: "0.00",
            displayOrder: 10,
          },
        ],
        totals: { amount: "0.00" },
      }),
    }),
  );

  const response = await app.inject({
    method: "GET",
    url: "/financial-statements/cash-flow?tenantId=TENANT-1&entityId=ENTITY-1&from=2026-01-01&to=2026-01-31",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().statementType, "CF");
  await app.close();
});
