import assert from "node:assert/strict";
import test from "node:test";
import type { AccountingEventRepositoryPort } from "../ports/accounting-event-repository";
import type { AuditLogPort } from "../ports/audit-log-port";
import { postAccountingEvent } from "./post-accounting-event";

test("postAccountingEvent generates and persists journals", async () => {
  const persisted: Array<Record<string, unknown>> = [];

  const repository: AccountingEventRepositoryPort = {
    async existsByIdempotencyKey() {
      return false;
    },
    async persistAccountingEvent(input) {
      persisted.push(input);
      return {
        eventId: input.event.eventId,
        journalCount: input.journals.length,
      };
    },
  };

  const auditLogs: Array<Record<string, unknown>> = [];
  const auditLog: AuditLogPort = {
    async log(input) {
      auditLogs.push(input);
    },
  };

  const result = await postAccountingEvent(
    {
      accountingEventRepository: repository,
      auditLog,
    },
    {
      tenantId: "TENANT-DEMO-001",
      actorUserId: "USER-001",
      accountingBasis: "KGAAP_GENERAL",
      baseCurrency: "USD",
      event: {
        eventId: "EVT-TEST-100",
        eventType: "interest_accrual",
        entityId: "ENT-SPC-001",
        bookCode: "SPC_BOOK",
        accountingDate: "2026-01-31",
        currency: "USD",
        amount: "42000",
        productId: "PROD-LOAN-001",
        contractId: "CTR-LOAN-001",
      },
    },
  );

  assert.equal(result.skippedAsDuplicate, false);
  assert.equal(result.journalCount, 1);
  assert.equal(persisted.length, 1);
  assert.equal(auditLogs.length, 1);
  assert.equal(result.journals[0].lines[0].accountCode, "131000");
});

test("postAccountingEvent skips duplicate idempotency key", async () => {
  let persisted = false;

  const repository: AccountingEventRepositoryPort = {
    async existsByIdempotencyKey() {
      return true;
    },
    async persistAccountingEvent() {
      persisted = true;
      return {
        eventId: "EVT-TEST-200",
        journalCount: 0,
      };
    },
  };

  const result = await postAccountingEvent(
    {
      accountingEventRepository: repository,
    },
    {
      tenantId: "TENANT-DEMO-001",
      accountingBasis: "KGAAP_GENERAL",
      baseCurrency: "USD",
      event: {
        eventId: "EVT-TEST-200",
        eventType: "principal_repayment",
        entityId: "ENT-SPC-001",
        bookCode: "SPC_BOOK",
        accountingDate: "2026-02-15",
        currency: "USD",
        amount: "1000000",
        productId: "PROD-LOAN-001",
      },
    },
  );

  assert.equal(result.skippedAsDuplicate, true);
  assert.equal(result.journalCount, 0);
  assert.equal(persisted, false);
});
