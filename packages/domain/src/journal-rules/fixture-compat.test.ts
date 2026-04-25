import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadScenarioFixture } from "@spc/test-fixtures";
import { generateJournalsForEvent } from "../use-cases/generate-journals";
import type { AccountingEvent, JournalDraft, JournalGenerationContext } from "../types";

const context: JournalGenerationContext = {
  accountingBasis: "KGAAP_GENERAL",
  baseCurrency: "USD",
};

const currentDir = dirname(fileURLToPath(import.meta.url));

const scenarioPaths = [
  "scenario-001-fund-subscription.yaml",
  "scenario-002-fund-to-spc.yaml",
  "scenario-003-asset-acquisition.yaml",
  "scenario-004-borrowing-drawdown.yaml",
  "scenario-005-interest-accrual.yaml",
  "scenario-006-interest-receipt.yaml",
  "scenario-007-principal-repayment.yaml",
  "scenario-008-fair-value-adjustment.yaml",
  "scenario-009-impairment.yaml",
  "scenario-010-foreign-exchange.yaml",
  "scenario-011-cash-waterfall.yaml",
].map((filename) => resolve(currentDir, "../../../../fixtures/scenarios", filename));

const normalizeAmount = (value: string | number | undefined) => Number(value ?? 0).toFixed(2);

const buildEventFromScenario = (
  scenario: ReturnType<typeof loadScenarioFixture>,
  inputEvent: Record<string, unknown>,
): AccountingEvent => {
  const actors = scenario.actors as Record<string, unknown>;

  if (String(inputEvent.event_type) === "equity_contribution_to_spc") {
    return {
      eventId: String(inputEvent.event_id),
      eventType: "equity_contribution_to_spc",
      entityId: String(inputEvent.from_entity_id),
      bookCode: String(actors.source_book_code),
      accountingDate: String(inputEvent.accounting_date),
      tradeDate: String(inputEvent.trade_date),
      settlementDate: String(inputEvent.settlement_date),
      currency: String(inputEvent.currency),
      amount: String(inputEvent.amount),
      contractId: String(inputEvent.contract_id),
      counterpartyEntityId: String(inputEvent.to_entity_id),
      metadata: {
        targetEntityId: String(inputEvent.to_entity_id),
        targetBookCode: String(actors.target_book_code),
      },
    };
  }

  if (String(inputEvent.event_type) === "fx_remeasurement") {
    return {
      eventId: String(inputEvent.event_id),
      eventType: "fx_remeasurement",
      entityId: String(actors.entity_id),
      bookCode: String(actors.book_code),
      accountingDate: String(inputEvent.accounting_date),
      tradeDate: String(inputEvent.trade_date),
      settlementDate: String(inputEvent.settlement_date),
      currency: String(inputEvent.to_currency ?? "KRW"),
      amount: String(inputEvent.amount),
      metadata: {
        fromCurrency: inputEvent.from_currency,
        toCurrency: inputEvent.to_currency,
        priorFxRate: inputEvent.prior_fx_rate,
        currentFxRate: inputEvent.current_fx_rate,
      },
    };
  }

  if (String(inputEvent.event_type) === "cash_waterfall_allocation") {
    return {
      eventId: String(inputEvent.event_id),
      eventType: "cash_waterfall_allocation",
      entityId: String(actors.entity_id),
      bookCode: String(actors.book_code),
      accountingDate: String(inputEvent.accounting_date),
      tradeDate: String(inputEvent.trade_date),
      settlementDate: String(inputEvent.settlement_date),
      currency: String(inputEvent.currency ?? "USD"),
      amount: String(inputEvent.gross_cash_inflow ?? inputEvent.amount ?? "0"),
      metadata: {
        waterfallRule: scenario.inputs["waterfall_rule"],
      },
    };
  }

  return {
    eventId: String(inputEvent.event_id),
    eventType: String(inputEvent.event_type) as AccountingEvent["eventType"],
    entityId: String(actors.entity_id),
    bookCode: String(actors.book_code),
    accountingDate: String(inputEvent.accounting_date),
    tradeDate: String(inputEvent.trade_date),
    settlementDate: String(inputEvent.settlement_date),
    currency: String(inputEvent.currency ?? "USD"),
    amount: String(inputEvent.amount ?? "0"),
    productId: inputEvent.product_id ? String(inputEvent.product_id) : undefined,
    contractId: inputEvent.contract_id ? String(inputEvent.contract_id) : undefined,
    counterpartyEntityId: inputEvent.to_entity_id ? String(inputEvent.to_entity_id) : undefined,
    investorId: inputEvent.investor_id ? String(inputEvent.investor_id) : undefined,
    metadata: inputEvent,
  };
};

const compareJournalDrafts = (
  scenarioCode: string,
  actual: JournalDraft[],
  expected: Array<Record<string, unknown>>,
) => {
  assert.equal(actual.length, expected.length, `${scenarioCode}: journal count should match`);

  for (const [index, expectedJournal] of expected.entries()) {
    const actualJournal = actual[index];
    assert.equal(actualJournal.entityId, String(expectedJournal.entity_id), `${scenarioCode}: entityId should match`);
    assert.equal(
      actualJournal.accountingDate,
      String(expectedJournal.accounting_date),
      `${scenarioCode}: accountingDate should match`,
    );

    const expectedLines = (expectedJournal.lines as Array<Record<string, unknown>> | undefined) ?? [];
    assert.equal(actualJournal.lines.length, expectedLines.length, `${scenarioCode}: line count should match`);

    for (const [lineIndex, expectedLine] of expectedLines.entries()) {
      const actualLine = actualJournal.lines[lineIndex];
      assert.equal(actualLine.accountCode, String(expectedLine.account_code), `${scenarioCode}: account code should match`);
      assert.equal(actualLine.side, String(expectedLine.side), `${scenarioCode}: side should match`);
      assert.equal(actualLine.currency, String(expectedLine.currency), `${scenarioCode}: currency should match`);
      assert.equal(
        normalizeAmount(actualLine.amount),
        normalizeAmount(expectedLine.amount as string | number | undefined),
        `${scenarioCode}: amount should match`,
      );

      if (expectedLine.product_id) {
        assert.equal(actualLine.productId, String(expectedLine.product_id), `${scenarioCode}: productId should match`);
      }

      if (expectedLine.contract_id) {
        assert.equal(actualLine.contractId, String(expectedLine.contract_id), `${scenarioCode}: contractId should match`);
      }

      if (expectedLine.counterparty_entity_id) {
        assert.equal(
          actualLine.counterpartyEntityId,
          String(expectedLine.counterparty_entity_id),
          `${scenarioCode}: counterpartyEntityId should match`,
        );
      }

      if (expectedLine.investor_id) {
        assert.equal(actualLine.investorId, String(expectedLine.investor_id), `${scenarioCode}: investorId should match`);
      }
    }
  }
};

test("fixture expected journals match generated domain journals", () => {
  for (const scenarioPath of scenarioPaths) {
    const scenario = loadScenarioFixture(scenarioPath);
    const inputEvents = (scenario.inputs["events"] as Array<Record<string, unknown>> | undefined) ?? [];
    const expectedJournals = (scenario.expected?.journals as Array<Record<string, unknown>> | undefined) ?? [];

    assert.ok(inputEvents.length >= 1, `${scenario.scenario.code}: should have at least one event`);
    assert.ok(expectedJournals.length >= 1, `${scenario.scenario.code}: should have expected journals`);

    const actualJournals = inputEvents.flatMap((inputEvent) =>
      generateJournalsForEvent(buildEventFromScenario(scenario, inputEvent), context),
    );
    compareJournalDrafts(scenario.scenario.code, actualJournals, expectedJournals);
  }
});
