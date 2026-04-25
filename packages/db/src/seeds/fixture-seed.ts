import { and, eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { loadCommonMasterFixture, loadScenarioFixture, type FixtureAliasMap } from "@spc/test-fixtures";
import {
  accounts,
  books,
  contracts,
  contractParties,
  entities,
  events,
  fxRates,
  fundInvestorPositions,
  investorAllocations,
  investors,
  journalLines,
  journals,
  products,
  statementMappings,
  tenants,
} from "../schema";

const TENANT_CODE = "TENANT-DEMO-001";
const TENANT_NAME = "Demo Tenant";
const ACCOUNTING_TIMEZONE = "Asia/Seoul";

const buildAliasMap = (): FixtureAliasMap => ({
  tenants: {},
  entities: {},
  books: {},
  investors: {},
  products: {},
  contracts: {},
  accounts: {},
  users: {},
});

const ensureTenant = async (db: NodePgDatabase, baseCurrency: string) => {
  const existing = await db.select().from(tenants).where(eq(tenants.code, TENANT_CODE)).limit(1);
  if (existing[0]) {
    return existing[0];
  }

  const inserted = await db
    .insert(tenants)
    .values({
      code: TENANT_CODE,
      name: TENANT_NAME,
      baseCurrency,
      accountingTimezone: ACCOUNTING_TIMEZONE,
    })
    .returning();

  return inserted[0];
};

const inferNormalBalance = (accountType: string): "debit" | "credit" => {
  if (accountType === "liability" || accountType === "equity" || accountType === "revenue") {
    return "credit";
  }

  return "debit";
};

export const seedCommonMaster = async (
  db: NodePgDatabase,
  commonFixturePath: string,
  coaFixturePath: string,
  exchangeRatesPath: string,
) => {
  const aliasMap = buildAliasMap();
  const common = loadCommonMasterFixture(commonFixturePath);
  const coa = loadScenarioFixture(coaFixturePath) as unknown as {
    accounts: Array<{ code: string; name: string; type: string; statement: "BS" | "PL" | "CF" }>;
    statement_mapping?: {
      rows?: Array<{
        statement: "BS" | "PL" | "CF";
        line_code: string;
        line_name: string;
        display_order: number;
        accounts: string[];
      }>;
    };
  };
  const rates = loadScenarioFixture(exchangeRatesPath) as unknown as {
    rates: Array<{ date: string; from: string; to: string; rate: number }>;
  };

  const tenant = await ensureTenant(db, common.metadata.base_currency);
  aliasMap.tenants[TENANT_CODE] = tenant.id;

  for (const entity of Object.values(common.entities)) {
    const inserted = await db
      .insert(entities)
      .values({
        tenantId: tenant.id,
        code: entity.code,
        name: entity.name,
        entityType: entity.type as "asset_manager" | "fund" | "spc" | "corporate" | "other",
        functionalCurrency: entity.functional_currency,
      })
      .onConflictDoNothing()
      .returning();

    const row =
      inserted[0] ??
      (await db.select().from(entities).where(eq(entities.code, entity.code)).limit(1))[0];

    aliasMap.entities[entity.id] = row.id;
  }

  for (const book of common.dimensions.books) {
    const entityId = aliasMap.entities[book.entity_id];
    const inserted = await db
      .insert(books)
      .values({
        tenantId: tenant.id,
        entityId,
        code: book.code,
        name: book.code,
        accountingBasis: common.dimensions.accounting_basis[0]?.code ?? "KGAAP_GENERAL",
      })
      .onConflictDoNothing()
      .returning();

    const row = inserted[0] ?? (await db.select().from(books).where(eq(books.code, book.code)).limit(1))[0];
    aliasMap.books[book.code] = row.id;
  }

  for (const investor of common.investors) {
    const inserted = await db
      .insert(investors)
      .values({
        tenantId: tenant.id,
        code: investor.code,
        name: investor.name,
        investorType: investor.type as "institutional" | "individual" | "other",
        defaultCurrency: investor.commitment_currency,
      })
      .onConflictDoNothing()
      .returning();

    const row =
      inserted[0] ??
      (await db.select().from(investors).where(eq(investors.code, investor.code)).limit(1))[0];

    aliasMap.investors[investor.id] = row.id;
  }

  for (const product of common.products) {
    const inserted = await db
      .insert(products)
      .values({
        tenantId: tenant.id,
        code: product.code,
        name: product.name,
        productType: product.product_type as "loan_receivable" | "bond" | "beneficiary_certificate" | "equity" | "derivative",
        currency: product.currency,
      })
      .onConflictDoNothing()
      .returning();

    const row =
      inserted[0] ??
      (await db.select().from(products).where(eq(products.code, product.code)).limit(1))[0];

    aliasMap.products[product.id] = row.id;
  }

  for (const contract of common.contracts) {
    const inserted = await db
      .insert(contracts)
      .values({
        tenantId: tenant.id,
        productId: aliasMap.products[contract.linked_product_id],
        contractType: contract.contract_type as
          | "loan_agreement"
          | "bond_investment"
          | "equity_subscription"
          | "beneficiary_subscription"
          | "other",
        code: contract.code,
        currency: contract.currency,
        effectiveDate: new Date("2026-01-01"),
        maturityDate: contract.maturity_date ? new Date(contract.maturity_date) : null,
        interestRateType: contract.interest_rate_type ?? null,
        interestRate: contract.interest_rate?.toString() ?? null,
        dayCountConvention: contract.day_count_convention ?? null,
      })
      .onConflictDoNothing()
      .returning();

    const row =
      inserted[0] ??
      (await db.select().from(contracts).where(eq(contracts.code, contract.code)).limit(1))[0];

    aliasMap.contracts[contract.id] = row.id;

    if (contract.lender_entity_id) {
      const existingParty = await db
        .select()
        .from(contractParties)
        .where(
          and(
            eq(contractParties.tenantId, tenant.id),
            eq(contractParties.contractId, row.id),
            eq(contractParties.partyRole, "lender"),
          ),
        )
        .limit(1);

      if (!existingParty[0]) {
        await db.insert(contractParties).values({
          tenantId: tenant.id,
          contractId: row.id,
          partyRole: "lender",
          entityId: aliasMap.entities[contract.lender_entity_id],
          externalPartyName: null,
        });
      }
    }

    if (contract.borrower_name) {
      const existingParty = await db
        .select()
        .from(contractParties)
        .where(
          and(
            eq(contractParties.tenantId, tenant.id),
            eq(contractParties.contractId, row.id),
            eq(contractParties.partyRole, "borrower"),
          ),
        )
        .limit(1);

      if (!existingParty[0]) {
        await db.insert(contractParties).values({
          tenantId: tenant.id,
          contractId: row.id,
          partyRole: "borrower",
          entityId: null,
          externalPartyName: contract.borrower_name,
        });
      }
    }
  }

  for (const account of coa.accounts) {
    const inserted = await db
      .insert(accounts)
      .values({
        tenantId: tenant.id,
        code: account.code,
        name: account.name,
        accountType: account.type as
          | "asset"
          | "liability"
          | "equity"
          | "revenue"
          | "expense"
          | "contra_asset",
        statementType: account.statement,
        normalBalance: inferNormalBalance(account.type),
      })
      .onConflictDoNothing()
      .returning();

    const row = inserted[0] ?? (await db.select().from(accounts).where(eq(accounts.code, account.code)).limit(1))[0];
    aliasMap.accounts[account.code] = row.id;
  }

  const statementMappingRows = coa.statement_mapping?.rows ?? [];
  for (const mapping of statementMappingRows) {
    for (const accountCode of mapping.accounts) {
      const accountId = aliasMap.accounts[accountCode];
      if (!accountId) {
        throw new Error(`Missing account alias for statement mapping account ${accountCode}`);
      }

      await db
        .insert(statementMappings)
        .values({
          tenantId: tenant.id,
          accountId,
          statementType: mapping.statement,
          lineCode: mapping.line_code,
          lineName: mapping.line_name,
          displayOrder: mapping.display_order,
        })
        .onConflictDoNothing();
    }
  }

  for (const rate of rates.rates) {
    await db
      .insert(fxRates)
      .values({
        tenantId: tenant.id,
        rateDate: new Date(`${rate.date}T00:00:00Z`),
        fromCurrency: rate.from,
        toCurrency: rate.to,
        rate: rate.rate.toString(),
        sourceName: "fixture",
      })
      .onConflictDoNothing();
  }

  const fundEntityId = aliasMap.entities[common.entities.fund.id];
  for (const investor of common.investors) {
    const existingPosition = await db
      .select()
      .from(fundInvestorPositions)
      .where(
        and(
          eq(fundInvestorPositions.tenantId, tenant.id),
          eq(fundInvestorPositions.fundEntityId, fundEntityId),
          eq(fundInvestorPositions.investorId, aliasMap.investors[investor.id]),
        ),
      )
      .limit(1);

    if (!existingPosition[0]) {
      await db.insert(fundInvestorPositions).values({
        tenantId: tenant.id,
        fundEntityId,
        investorId: aliasMap.investors[investor.id],
        commitmentAmount: String(investor.commitment_amount ?? 0),
        paidInAmount: String(investor.paid_in_amount ?? 0),
        ownershipRatio: investor.ownership_ratio.toString(),
        effectiveFrom: new Date("2026-01-01"),
        effectiveTo: null,
      });
    }
  }

  return { tenant, aliasMap };
};

const findAccountId = (aliasMap: FixtureAliasMap, accountCode: string) => {
  const accountId = aliasMap.accounts[accountCode];
  if (!accountId) {
    throw new Error(`Missing account alias for code ${accountCode}`);
  }

  return accountId;
};

export const seedScenarioExpectedPosting = async (
  db: NodePgDatabase,
  scenarioPath: string,
  aliasMap: FixtureAliasMap,
  tenantId: string,
) => {
  const scenario = loadScenarioFixture(scenarioPath);
  const actorBookCode = (scenario.actors.book_code as string | undefined) ?? undefined;
  const actorEntityFixtureId = (scenario.actors.entity_id as string | undefined) ?? undefined;

  const defaultBookId = actorBookCode ? aliasMap.books[actorBookCode] : undefined;
  const defaultEntityId = actorEntityFixtureId ? aliasMap.entities[actorEntityFixtureId] : undefined;

  const resolveBookIdForEntity = (entityFixtureId: string) => {
    if (defaultBookId) return defaultBookId;

    const sourceBookCode = scenario.actors["source_book_code"] as string | undefined;
    const targetBookCode = scenario.actors["target_book_code"] as string | undefined;
    const sourceEntityFixtureId = scenario.actors["fund_entity_id"] as string | undefined;
    const targetEntityFixtureId = scenario.actors["spc_entity_id"] as string | undefined;

    if (sourceBookCode && sourceEntityFixtureId && sourceEntityFixtureId === entityFixtureId) {
      return aliasMap.books[sourceBookCode];
    }

    if (targetBookCode && targetEntityFixtureId && targetEntityFixtureId === entityFixtureId) {
      return aliasMap.books[targetBookCode];
    }

    if (entityFixtureId === "ENT-FUND-001") {
      return aliasMap.books["FUND_BOOK"];
    }

    if (entityFixtureId === "ENT-SPC-001") {
      return aliasMap.books["SPC_BOOK"];
    }

    return undefined;
  };

  const inputEvents = (scenario.inputs.events as Array<Record<string, unknown>> | undefined) ?? [];
  for (const event of inputEvents) {
    await db
      .insert(events)
      .values({
        tenantId,
        entityId: defaultEntityId ?? aliasMap.entities[String(event.from_entity_id ?? actorEntityFixtureId)],
        bookId: defaultBookId ?? aliasMap.books[String(scenario.actors.source_book_code ?? actorBookCode)],
        eventType: String(event.event_type),
        idempotencyKey: String(event.event_id),
        tradeDate: new Date(`${String(event.trade_date)}T00:00:00Z`),
        accountingDate: new Date(`${String(event.accounting_date)}T00:00:00Z`),
        settlementDate: event.settlement_date ? new Date(`${String(event.settlement_date)}T00:00:00Z`) : null,
        currency: String(event.currency ?? "USD"),
        amount: String(event.amount ?? "0"),
        productId: event.product_id ? aliasMap.products[String(event.product_id)] : null,
        contractId: event.contract_id ? aliasMap.contracts[String(event.contract_id)] : null,
        counterpartyEntityId: event.to_entity_id ? aliasMap.entities[String(event.to_entity_id)] : null,
        investorId: event.investor_id ? aliasMap.investors[String(event.investor_id)] : null,
        sourceReference: scenario.scenario.code,
        payloadJson: event,
        status: "validated",
      })
      .onConflictDoNothing();
  }

  const expectedJournals = (scenario.expected?.journals as Array<Record<string, unknown>> | undefined) ?? [];
  for (const expectedJournal of expectedJournals) {
    const journalEntityFixtureId = String(expectedJournal.entity_id);
    const journalEntityId = aliasMap.entities[journalEntityFixtureId];
    const journalBookId = resolveBookIdForEntity(journalEntityFixtureId);

    if (!journalBookId) {
      throw new Error(`Missing book mapping for journal entity ${journalEntityFixtureId} in ${scenario.scenario.code}`);
    }

    const accountingDate = new Date(`${String(expectedJournal.accounting_date)}T00:00:00Z`);

    const insertedJournal = await db
      .insert(journals)
      .values({
        tenantId,
        entityId: journalEntityId,
        bookId: journalBookId,
        sourceEventId: null,
        journalNo: String(expectedJournal.journal_id),
        journalType: "fixture_expected",
        accountingDate,
        postingStatus: "posted",
        description: scenario.scenario.name,
      })
      .onConflictDoNothing()
      .returning();

    const journalRow =
      insertedJournal[0] ??
      (await db.select().from(journals).where(eq(journals.journalNo, String(expectedJournal.journal_id))).limit(1))[0];

    const lines = (expectedJournal.lines as Array<Record<string, unknown>> | undefined) ?? [];
    for (const [index, line] of lines.entries()) {
      const amount = String(line.amount ?? "0");
      const isDebit = String(line.side) === "debit";
      await db.insert(journalLines).values({
        tenantId,
        journalId: journalRow.id,
        lineNo: index + 1,
        accountId: findAccountId(aliasMap, String(line.account_code)),
        debitAmount: isDebit ? amount : "0",
        creditAmount: isDebit ? "0" : amount,
        currency: String(line.currency ?? "USD"),
        amountScale: String(line.currency ?? "USD") === "KRW" ? 0 : 2,
        fxRate: null,
        amountInFunctionalCurrency: amount,
        productId: line.product_id ? aliasMap.products[String(line.product_id)] : null,
        contractId: line.contract_id ? aliasMap.contracts[String(line.contract_id)] : null,
        counterpartyEntityId: line.counterparty_entity_id
          ? aliasMap.entities[String(line.counterparty_entity_id)]
          : null,
        investorId: line.investor_id ? aliasMap.investors[String(line.investor_id)] : null,
        description: scenario.scenario.code,
      }).onConflictDoNothing();
    }
  }

  const allocations = (scenario.expected?.allocations as Array<Record<string, unknown>> | undefined) ?? [];
  const allocationSource = (scenario.inputs["allocation_source"] as Record<string, unknown> | undefined) ?? {};
  const ownershipEntries = (allocationSource["ownership"] as Array<Record<string, unknown>> | undefined) ?? [];
  const fundEntityIdFixture = String(scenario.actors.entity_id ?? "ENT-FUND-001");
  for (const allocation of allocations) {
    const matchedOwnership = ownershipEntries.find(
      (owner) => String(owner["investor_id"]) === String(allocation.investor_id),
    );

    await db
      .insert(investorAllocations)
      .values({
        tenantId,
        fundEntityId: aliasMap.entities[fundEntityIdFixture],
        periodStart: new Date(`${String(allocationSource["period_start"] ?? "2026-01-01")}T00:00:00Z`),
        periodEnd: new Date(`${String(allocationSource["period_end"] ?? "2026-01-31")}T00:00:00Z`),
        allocationMethod: String(scenario.actors.allocation_method ?? "pro_rata"),
        sourceAmountType: "profit",
        sourceAmount: String(allocationSource["distributable_profit"] ?? "0"),
        investorId: aliasMap.investors[String(allocation.investor_id)],
        ownershipRatio: String(matchedOwnership?.["ratio"] ?? "0"),
        allocatedProfitAmount: String(allocation.profit_allocation ?? "0"),
        cashDistributionAmount: String(allocation.cash_distribution ?? "0"),
      })
      .onConflictDoNothing();
  }
};

export const resetFixtureData = async (db: NodePgDatabase) => {
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
