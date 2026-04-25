import { sql } from "drizzle-orm";
import {
  check,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts, books, entities, tenants, users } from "./core";
import { contracts, investors, products } from "./investments";

export const eventStatusEnum = pgEnum("event_status", ["draft", "validated", "posted", "reversed"]);
export const postingStatusEnum = pgEnum("posting_status", ["draft", "approved", "posted", "reversed"]);
export const periodTypeEnum = pgEnum("period_type", ["month", "quarter", "year"]);
export const closeStatusEnum = pgEnum("close_status", ["open", "closing", "closed", "reopened"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 200 }).notNull(),
    status: eventStatusEnum("status").notNull().default("draft"),
    tradeDate: date("trade_date").notNull(),
    accountingDate: date("accounting_date").notNull(),
    settlementDate: date("settlement_date"),
    currency: varchar("currency", { length: 3 }).notNull(),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    productId: uuid("product_id").references(() => products.id),
    contractId: uuid("contract_id").references(() => contracts.id),
    counterpartyEntityId: uuid("counterparty_entity_id").references(() => entities.id),
    investorId: uuid("investor_id").references(() => investors.id),
    sourceReference: varchar("source_reference", { length: 200 }),
    payloadJson: jsonb("payload_json"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idempotencyUq: uniqueIndex("events_tenant_type_idempotency_uq").on(
      table.tenantId,
      table.eventType,
      table.idempotencyKey,
    ),
    accountingDateIdx: uniqueIndex("events_tenant_entity_date_idx").on(
      table.tenantId,
      table.entityId,
      table.accountingDate,
      table.id,
    ),
  }),
);

export const eventCalculations = pgTable("event_calculations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  calculationType: varchar("calculation_type", { length: 50 }).notNull(),
  inputPayloadJson: jsonb("input_payload_json").notNull(),
  resultPayloadJson: jsonb("result_payload_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const journals = pgTable(
  "journals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id),
    sourceEventId: uuid("source_event_id").references(() => events.id),
    journalNo: varchar("journal_no", { length: 50 }).notNull(),
    journalType: varchar("journal_type", { length: 50 }).notNull(),
    accountingDate: date("accounting_date").notNull(),
    postingStatus: postingStatusEnum("posting_status").notNull().default("draft"),
    description: varchar("description", { length: 500 }),
    createdBy: uuid("created_by").references(() => users.id),
    approvedBy: uuid("approved_by").references(() => users.id),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    journalNoUq: uniqueIndex("journals_tenant_journal_no_uq").on(table.tenantId, table.journalNo),
  }),
);

export const journalLines = pgTable(
  "journal_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    journalId: uuid("journal_id")
      .notNull()
      .references(() => journals.id),
    lineNo: integer("line_no").notNull(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    debitAmount: numeric("debit_amount", { precision: 20, scale: 2 }).notNull().default("0"),
    creditAmount: numeric("credit_amount", { precision: 20, scale: 2 }).notNull().default("0"),
    currency: varchar("currency", { length: 3 }).notNull(),
    amountScale: integer("amount_scale").notNull().default(2),
    fxRate: numeric("fx_rate", { precision: 20, scale: 8 }),
    amountInFunctionalCurrency: numeric("amount_in_functional_currency", { precision: 20, scale: 2 }),
    productId: uuid("product_id").references(() => products.id),
    contractId: uuid("contract_id").references(() => contracts.id),
    counterpartyEntityId: uuid("counterparty_entity_id").references(() => entities.id),
    investorId: uuid("investor_id").references(() => investors.id),
    description: varchar("description", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    journalLineUq: uniqueIndex("journal_lines_tenant_journal_line_uq").on(
      table.tenantId,
      table.journalId,
      table.lineNo,
    ),
    debitCreditCheck: check(
      "journal_lines_debit_credit_check",
      sql`${table.debitAmount} = 0 AND ${table.creditAmount} > 0 OR ${table.creditAmount} = 0 AND ${table.debitAmount} > 0`,
    ),
  }),
);

export const closePeriods = pgTable(
  "close_periods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id),
    periodType: periodTypeEnum("period_type").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    status: closeStatusEnum("status").notNull().default("open"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closedBy: uuid("closed_by").references(() => users.id),
    ...timestamps,
  },
  (table) => ({
    closePeriodUq: uniqueIndex("close_periods_tenant_book_period_uq").on(
      table.tenantId,
      table.bookId,
      table.periodType,
      table.periodStart,
      table.periodEnd,
    ),
  }),
);

export const closeAdjustmentJournals = pgTable("close_adjustment_journals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  closePeriodId: uuid("close_period_id")
    .notNull()
    .references(() => closePeriods.id),
  journalId: uuid("journal_id")
    .notNull()
    .references(() => journals.id),
  reverseOnDate: date("reverse_on_date"),
  reversalJournalId: uuid("reversal_journal_id").references(() => journals.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
