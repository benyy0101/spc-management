import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { entities, tenants } from "./core";

export const investorTypeEnum = pgEnum("investor_type", ["institutional", "individual", "other"]);
export const productTypeEnum = pgEnum("product_type", [
  "loan_receivable",
  "bond",
  "beneficiary_certificate",
  "equity",
  "derivative",
]);
export const contractTypeEnum = pgEnum("contract_type", [
  "loan_agreement",
  "bond_investment",
  "equity_subscription",
  "beneficiary_subscription",
  "other",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const investors = pgTable(
  "investors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    investorType: investorTypeEnum("investor_type").notNull(),
    defaultCurrency: varchar("default_currency", { length: 3 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    ...timestamps,
  },
  (table) => ({
    tenantCodeUq: uniqueIndex("investors_tenant_code_uq").on(table.tenantId, table.code),
  }),
);

export const fundInvestorPositions = pgTable("fund_investor_positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  fundEntityId: uuid("fund_entity_id")
    .notNull()
    .references(() => entities.id),
  investorId: uuid("investor_id")
    .notNull()
    .references(() => investors.id),
  commitmentAmount: numeric("commitment_amount", { precision: 20, scale: 2 }).notNull().default("0"),
  paidInAmount: numeric("paid_in_amount", { precision: 20, scale: 2 }).notNull().default("0"),
  ownershipRatio: numeric("ownership_ratio", { precision: 12, scale: 8 }).notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    productType: productTypeEnum("product_type").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    ...timestamps,
  },
  (table) => ({
    tenantCodeUq: uniqueIndex("products_tenant_code_uq").on(table.tenantId, table.code),
  }),
);

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    contractType: contractTypeEnum("contract_type").notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    effectiveDate: date("effective_date").notNull(),
    maturityDate: date("maturity_date"),
    interestRateType: varchar("interest_rate_type", { length: 30 }),
    interestRate: numeric("interest_rate", { precision: 12, scale: 8 }),
    dayCountConvention: varchar("day_count_convention", { length: 30 }),
    versionNo: integer("version_no").notNull().default(1),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    metadata: text("metadata"),
    ...timestamps,
  },
  (table) => ({
    tenantCodeVersionUq: uniqueIndex("contracts_tenant_code_version_uq").on(
      table.tenantId,
      table.code,
      table.versionNo,
    ),
  }),
);

export const contractParties = pgTable("contract_parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id),
  partyRole: varchar("party_role", { length: 50 }).notNull(),
  entityId: uuid("entity_id").references(() => entities.id),
  externalPartyName: varchar("external_party_name", { length: 200 }),
  ...timestamps,
});

export const investorAllocations = pgTable("investor_allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  fundEntityId: uuid("fund_entity_id")
    .notNull()
    .references(() => entities.id),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  allocationMethod: varchar("allocation_method", { length: 30 }).notNull(),
  sourceAmountType: varchar("source_amount_type", { length: 30 }).notNull(),
  sourceAmount: numeric("source_amount", { precision: 20, scale: 2 }).notNull(),
  investorId: uuid("investor_id")
    .notNull()
    .references(() => investors.id),
  ownershipRatio: numeric("ownership_ratio", { precision: 12, scale: 8 }).notNull(),
  allocatedProfitAmount: numeric("allocated_profit_amount", { precision: 20, scale: 2 }).notNull(),
  cashDistributionAmount: numeric("cash_distribution_amount", { precision: 20, scale: 2 }).notNull(),
  ...timestamps,
});
