import assert from "node:assert/strict";
import test from "node:test";
import { generateJournalsForEvent } from "../use-cases/generate-journals";
import type { AccountingEvent, JournalGenerationContext } from "../types";

const context: JournalGenerationContext = {
  accountingBasis: "KGAAP_GENERAL",
  baseCurrency: "USD",
};

test("interest_accrual generates accrued interest and interest income", () => {
  const event: AccountingEvent = {
    eventId: "EVT-TEST-001",
    eventType: "interest_accrual",
    entityId: "ENT-SPC-001",
    bookCode: "SPC_BOOK",
    accountingDate: "2026-01-31",
    currency: "USD",
    amount: "42000",
    productId: "PROD-LOAN-001",
    contractId: "CTR-LOAN-001",
  };

  const journals = generateJournalsForEvent(event, context);
  assert.equal(journals.length, 1);
  assert.equal(journals[0].lines[0].accountCode, "131000");
  assert.equal(journals[0].lines[1].accountCode, "411000");
});

test("equity_contribution_to_spc generates fund and spc journals", () => {
  const event: AccountingEvent = {
    eventId: "EVT-TEST-002",
    eventType: "equity_contribution_to_spc",
    entityId: "ENT-FUND-001",
    bookCode: "FUND_BOOK",
    accountingDate: "2026-01-03",
    currency: "USD",
    amount: "8000000",
    contractId: "CTR-SPC-FUND-001",
    metadata: {
      targetEntityId: "ENT-SPC-001",
      targetBookCode: "SPC_BOOK",
    },
  };

  const journals = generateJournalsForEvent(event, context);
  assert.equal(journals.length, 2);
  assert.equal(journals[0].entityId, "ENT-FUND-001");
  assert.equal(journals[1].entityId, "ENT-SPC-001");
  assert.equal(journals[0].lines[0].accountCode, "123000");
  assert.equal(journals[1].lines[1].accountCode, "311000");
});
