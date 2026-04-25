import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const tenantStatusEnum = pgEnum("tenant_status", ["active", "inactive"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
export const entityTypeEnum = pgEnum("entity_type", [
  "asset_manager",
  "fund",
  "spc",
  "corporate",
  "other",
]);
export const bookTypeEnum = pgEnum("book_type", ["primary", "secondary", "reporting"]);
export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
  "contra_asset",
]);
export const statementTypeEnum = pgEnum("statement_type", ["BS", "PL", "CF"]);
export const normalBalanceEnum = pgEnum("normal_balance", ["debit", "credit"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    status: tenantStatusEnum("status").notNull().default("active"),
    baseCurrency: varchar("base_currency", { length: 3 }).notNull(),
    accountingTimezone: varchar("accounting_timezone", { length: 64 }).notNull(),
    settings: jsonb("settings"),
    ...timestamps,
  },
  (table) => ({
    codeUq: uniqueIndex("tenants_code_uq").on(table.code),
  }),
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    status: userStatusEnum("status").notNull().default("active"),
    authSubject: varchar("auth_subject", { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => ({
    tenantEmailUq: uniqueIndex("users_tenant_email_uq").on(table.tenantId, table.email),
  }),
);

export const entities = pgTable(
  "entities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    entityType: entityTypeEnum("entity_type").notNull(),
    functionalCurrency: varchar("functional_currency", { length: 3 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    ...timestamps,
  },
  (table) => ({
    tenantCodeUq: uniqueIndex("entities_tenant_code_uq").on(table.tenantId, table.code),
  }),
);

export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    bookType: bookTypeEnum("book_type").notNull().default("primary"),
    accountingBasis: varchar("accounting_basis", { length: 50 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    ...timestamps,
  },
  (table) => ({
    tenantCodeUq: uniqueIndex("books_tenant_code_uq").on(table.tenantId, table.code),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    accountType: accountTypeEnum("account_type").notNull(),
    statementType: statementTypeEnum("statement_type").notNull(),
    normalBalance: normalBalanceEnum("normal_balance").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    tenantCodeUq: uniqueIndex("accounts_tenant_code_uq").on(table.tenantId, table.code),
  }),
);

export const statementMappings = pgTable(
  "statement_mappings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    statementType: statementTypeEnum("statement_type").notNull(),
    lineCode: varchar("line_code", { length: 50 }).notNull(),
    lineName: varchar("line_name", { length: 200 }).notNull(),
    displayOrder: integer("display_order").notNull(),
    ...timestamps,
  },
  (table) => ({
    tenantLineOrderUq: uniqueIndex("statement_mappings_tenant_line_order_uq").on(
      table.tenantId,
      table.statementType,
      table.lineCode,
      table.accountId,
    ),
  }),
);

export const fxRates = pgTable(
  "fx_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    rateDate: timestamp("rate_date", { withTimezone: false }).notNull(),
    fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
    toCurrency: varchar("to_currency", { length: 3 }).notNull(),
    rate: numeric("rate", { precision: 20, scale: 8 }).notNull(),
    sourceName: varchar("source_name", { length: 100 }).notNull(),
    ...timestamps,
  },
  (table) => ({
    tenantRateUq: uniqueIndex("fx_rates_tenant_rate_uq").on(
      table.tenantId,
      table.rateDate,
      table.fromCurrency,
      table.toCurrency,
      table.sourceName,
    ),
  }),
);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: uuid("resource_id").notNull(),
  beforePayloadJson: jsonb("before_payload_json"),
  afterPayloadJson: jsonb("after_payload_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
