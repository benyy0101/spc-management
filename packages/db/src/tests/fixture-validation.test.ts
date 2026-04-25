import assert from "node:assert/strict";
import test from "node:test";
import { and, eq } from "drizzle-orm";
import { createDb } from "../client";
import { accounts, tenants } from "../schema/core";
import { investorAllocations, investors, products } from "../schema/investments";
import { journalLines, journals } from "../schema/accounting";
import { resetFixtureData, seedCommonMaster, seedScenarioExpectedPosting } from "../seeds/fixture-seed";
import {
  COA_FIXTURE_PATH,
  COMMON_FIXTURE_PATH,
  EXCHANGE_RATES_FIXTURE_PATH,
  SCENARIO_FIXTURE_PATHS,
} from "../seeds/fixture-paths";
import { loadScenarioFixture } from "@spc/test-fixtures";

const getDatabaseUrl = () => {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required for fixture validation tests");
  }

  return value;
};

const normalizeNumeric = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return "0";
  return Number(value).toFixed(2);
};

test("fixture journals match expected journals", async () => {
  const db = createDb(getDatabaseUrl());

  await resetFixtureData(db);
  const { tenant, aliasMap } = await seedCommonMaster(
    db,
    COMMON_FIXTURE_PATH,
    COA_FIXTURE_PATH,
    EXCHANGE_RATES_FIXTURE_PATH,
  );

  for (const scenarioPath of SCENARIO_FIXTURE_PATHS) {
    await seedScenarioExpectedPosting(db, scenarioPath, aliasMap, tenant.id);
  }

  const tenantRow = await db.select().from(tenants).where(eq(tenants.code, "TENANT-DEMO-001")).limit(1);
  assert.equal(tenantRow[0]?.accountingTimezone, "Asia/Seoul");

  for (const scenarioPath of SCENARIO_FIXTURE_PATHS) {
    const scenario = loadScenarioFixture(scenarioPath);
    const expectedJournals = (scenario.expected?.journals as Array<Record<string, unknown>> | undefined) ?? [];

    for (const expectedJournal of expectedJournals) {
      const journalNo = String(expectedJournal.journal_id);
      const journalRows = await db
        .select()
        .from(journals)
        .where(and(eq(journals.tenantId, tenant.id), eq(journals.journalNo, journalNo)))
        .limit(1);

      assert.equal(journalRows.length, 1, `journal ${journalNo} should exist`);

      const journal = journalRows[0];
      const entityFixtureId = String(expectedJournal.entity_id);
      assert.equal(journal.entityId, aliasMap.entities[entityFixtureId], `journal ${journalNo} entity should match`);

      const lineRows = await db
        .select()
        .from(journalLines)
        .where(and(eq(journalLines.tenantId, tenant.id), eq(journalLines.journalId, journal.id)));

      const sortedLineRows = [...lineRows].sort((a, b) => a.lineNo - b.lineNo);
      const expectedLines = (expectedJournal.lines as Array<Record<string, unknown>> | undefined) ?? [];
      assert.equal(sortedLineRows.length, expectedLines.length, `journal ${journalNo} line count should match`);

      for (const [index, expectedLine] of expectedLines.entries()) {
        const row = sortedLineRows[index];
        const accountCode = String(expectedLine.account_code);
        const accountRows = await db
          .select()
          .from(accounts)
          .where(and(eq(accounts.tenantId, tenant.id), eq(accounts.id, row.accountId)))
          .limit(1);

        assert.equal(accountRows[0]?.code, accountCode, `journal ${journalNo} account code should match`);
        assert.equal(row.currency, String(expectedLine.currency ?? "USD"), `journal ${journalNo} currency should match`);

        const expectedAmount = normalizeNumeric(expectedLine.amount as string | number | undefined);
        if (String(expectedLine.side) === "debit") {
          assert.equal(normalizeNumeric(row.debitAmount), expectedAmount, `journal ${journalNo} debit amount should match`);
          assert.equal(normalizeNumeric(row.creditAmount), "0.00", `journal ${journalNo} debit line should have zero credit`);
        } else {
          assert.equal(normalizeNumeric(row.creditAmount), expectedAmount, `journal ${journalNo} credit amount should match`);
          assert.equal(normalizeNumeric(row.debitAmount), "0.00", `journal ${journalNo} credit line should have zero debit`);
        }

        if (expectedLine.investor_id) {
          const investorRows = await db
            .select()
            .from(investors)
            .where(and(eq(investors.tenantId, tenant.id), eq(investors.id, row.investorId!)))
            .limit(1);
          assert.equal(
            aliasMap.investors[String(expectedLine.investor_id)],
            investorRows[0]?.id,
            `journal ${journalNo} investor should match`,
          );
        }

        if (expectedLine.product_id) {
          const productRows = await db
            .select()
            .from(products)
            .where(and(eq(products.tenantId, tenant.id), eq(products.id, row.productId!)))
            .limit(1);
          assert.equal(
            aliasMap.products[String(expectedLine.product_id)],
            productRows[0]?.id,
            `journal ${journalNo} product should match`,
          );
        }
      }
    }
  }
});

test("fixture investor allocations match expected allocations", async () => {
  const db = createDb(getDatabaseUrl());
  const tenantRows = await db.select().from(tenants).where(eq(tenants.code, "TENANT-DEMO-001")).limit(1);
  assert.equal(tenantRows.length, 1, "tenant should exist before allocation validation");
  const tenant = tenantRows[0];

  const allocationScenario = loadScenarioFixture("../../fixtures/scenarios/scenario-013-investor-allocation.yaml");
  const expectedAllocations =
    (allocationScenario.expected?.allocations as Array<Record<string, unknown>> | undefined) ?? [];

  for (const expectedAllocation of expectedAllocations) {
    const investorRows = await db
      .select()
      .from(investors)
      .where(and(eq(investors.tenantId, tenant.id), eq(investors.code, expectedAllocation.investor_id === "INV-001" ? "LP-ALPHA" : "LP-BETA")))
      .limit(1);

    assert.equal(investorRows.length, 1, `investor ${String(expectedAllocation.investor_id)} should exist`);

    const allocationRows = await db
      .select()
      .from(investorAllocations)
      .where(and(eq(investorAllocations.tenantId, tenant.id), eq(investorAllocations.investorId, investorRows[0].id)));

    assert.ok(allocationRows.length >= 1, `allocation for ${String(expectedAllocation.investor_id)} should exist`);

    const matched = allocationRows.find(
      (row) =>
        normalizeNumeric(row.allocatedProfitAmount) === normalizeNumeric(expectedAllocation.profit_allocation as string | number | undefined) &&
        normalizeNumeric(row.cashDistributionAmount) === normalizeNumeric(expectedAllocation.cash_distribution as string | number | undefined),
    );

    assert.ok(matched, `allocation amounts for ${String(expectedAllocation.investor_id)} should match expected`);
  }
});
