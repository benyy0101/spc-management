export type EventReadModel = {
  id: string;
  tenantId: string;
  entityId: string;
  entityCode: string;
  bookId: string;
  bookCode: string;
  eventType: string;
  idempotencyKey: string;
  status: string;
  tradeDate: string;
  accountingDate: string;
  settlementDate: string | null;
  currency: string;
  amount: string;
  productId: string | null;
  contractId: string | null;
  counterpartyEntityId: string | null;
  investorId: string | null;
  sourceReference: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type EntityReadModel = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  entityType: string;
  functionalCurrency: string;
  status: string;
};

export type CreateEntityInput = {
  tenantId: string;
  code: string;
  name: string;
  entityType: "asset_manager" | "fund" | "spc" | "corporate" | "other";
  functionalCurrency: string;
  status?: "active" | "inactive";
};

export type UpdateEntityInput = {
  code?: string;
  name?: string;
  entityType?: "asset_manager" | "fund" | "spc" | "corporate" | "other";
  functionalCurrency?: string;
  status?: "active" | "inactive";
};

export type TenantReadModel = {
  id: string;
  code: string;
  name: string;
  status: string;
  baseCurrency: string;
  accountingTimezone: string;
};

export type AccountReadModel = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  accountType: string;
  statementType: string;
  normalBalance: string;
  isActive: boolean;
};

export type StatementMappingReadModel = {
  id: string;
  tenantId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  statementType: string;
  lineCode: string;
  lineName: string;
  displayOrder: number;
};

export type CreateStatementMappingInput = {
  tenantId: string;
  accountId: string;
  statementType: "BS" | "PL" | "CF";
  lineCode: string;
  lineName: string;
  displayOrder: number;
};

export type UpdateStatementMappingInput = {
  lineCode?: string;
  lineName?: string;
  displayOrder?: number;
};

export type ClosePeriodReadModel = {
  id: string;
  tenantId: string;
  entityId: string;
  entityCode: string;
  bookId: string;
  bookCode: string;
  periodType: "month" | "quarter" | "year";
  periodStart: string;
  periodEnd: string;
  status: "open" | "closing" | "closed" | "reopened";
  closedAt: string | null;
  closedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateClosePeriodInput = {
  tenantId: string;
  entityId: string;
  bookId: string;
  periodType: "month" | "quarter" | "year";
  periodStart: string;
  periodEnd: string;
  status?: "open" | "closing" | "closed" | "reopened";
  closedBy?: string;
};

export type ClosePeriodListFilters = {
  tenantId: string;
  entityId?: string;
  bookId?: string;
  status?: "open" | "closing" | "closed" | "reopened";
};

export type UpdateClosePeriodStatusInput = {
  status: "open" | "closing" | "closed" | "reopened";
  closedBy?: string;
};

export type InvestorPositionReadModel = {
  id: string;
  tenantId: string;
  fundEntityId: string;
  fundEntityCode: string;
  investorId: string;
  investorCode: string;
  investorName: string;
  ownershipRatio: string;
  commitmentAmount: string;
  paidInAmount: string;
  effectiveFrom: string;
  effectiveTo: string | null;
};

export type InvestorPositionFilters = {
  tenantId: string;
  fundEntityId?: string;
};

export type InvestorAllocationReadModel = {
  id: string;
  tenantId: string;
  fundEntityId: string;
  fundEntityCode: string;
  investorId: string;
  investorCode: string;
  investorName: string;
  periodStart: string;
  periodEnd: string;
  allocationMethod: string;
  sourceAmountType: string;
  sourceAmount: string;
  ownershipRatio: string;
  allocatedProfitAmount: string;
  cashDistributionAmount: string;
  createdAt: string;
  updatedAt: string;
};

export type AllocationListFilters = {
  tenantId: string;
  fundEntityId?: string;
  investorId?: string;
  periodStart?: string;
  periodEnd?: string;
};

export type RunAllocationInput = {
  tenantId: string;
  fundEntityId: string;
  periodStart: string;
  periodEnd: string;
  method: "pro_rata";
  sourceAmountType?: "profit";
  sourceAmount: string;
  cashDistributionAmount?: string;
};

export type ReverseJournalInput = {
  tenantId: string;
  journalId: string;
  reversalDate?: string;
  actorUserId?: string;
};

export type ReverseJournalResultReadModel = {
  originalJournalId: string;
  originalJournalNo: string;
  reversalJournalId: string;
  reversalJournalNo: string;
  accountingDate: string;
};

export type ReprocessEventInput = {
  tenantId: string;
  eventId: string;
  actorUserId?: string;
};

export type ReprocessEventResultReadModel = {
  eventId: string;
  reversedJournalCount: number;
  newJournalCount: number;
  journalNos: string[];
};

export type ManualJournalLineInput = {
  accountCode: string;
  side: "debit" | "credit";
  amount: string;
  currency: string;
  productId?: string;
  contractId?: string;
  counterpartyEntityId?: string;
  investorId?: string;
  description?: string;
};

export type CreateManualJournalInput = {
  tenantId: string;
  entityId: string;
  bookCode?: string;
  accountingDate: string;
  description?: string;
  actorUserId?: string;
  lines: ManualJournalLineInput[];
};

export type ManualJournalResultReadModel = {
  journalId: string;
  journalNo: string;
  accountingDate: string;
  lineCount: number;
};

export type ApproveJournalInput = {
  tenantId: string;
  journalId: string;
  actorUserId?: string;
};

export type ApproveJournalResultReadModel = {
  journalId: string;
  journalNo: string;
  postingStatus: "approved";
  approvedBy: string | null;
};

export type AuditLogReadModel = {
  id: string;
  tenantId: string;
  actorUserId: string | null;
  actionType: string;
  resourceType: string;
  resourceId: string;
  beforePayload: Record<string, unknown> | null;
  afterPayload: Record<string, unknown> | null;
  createdAt: string;
};

export type AuditLogFilters = {
  tenantId: string;
  actionType?: string;
  resourceType?: string;
  resourceId?: string;
};

export type ProductReadModel = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  productType: string;
  currency: string;
  status: string;
};

export type ContractReadModel = {
  id: string;
  tenantId: string;
  productId: string;
  productCode: string;
  code: string;
  contractType: string;
  currency: string;
  effectiveDate: string;
  maturityDate: string | null;
  interestRateType: string | null;
  interestRate: string | null;
  dayCountConvention: string | null;
  versionNo: number;
  status: string;
};

export type EventListFilters = {
  tenantId: string;
  entityId?: string;
  eventType?: string;
  status?: string;
  from?: string;
  to?: string;
};

export type JournalLineReadModel = {
  id: string;
  lineNo: number;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: string;
  creditAmount: string;
  currency: string;
  amountScale: number;
  productId: string | null;
  contractId: string | null;
  counterpartyEntityId: string | null;
  investorId: string | null;
  description: string | null;
};

export type JournalReadModel = {
  id: string;
  tenantId: string;
  entityId: string;
  entityCode: string;
  bookId: string;
  bookCode: string;
  sourceEventId: string | null;
  journalNo: string;
  journalType: string;
  accountingDate: string;
  postingStatus: string;
  description: string | null;
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lines?: JournalLineReadModel[];
};

export type JournalListFilters = {
  tenantId: string;
  entityId?: string;
  from?: string;
  to?: string;
};

export type TrialBalanceLineReadModel = {
  accountId: string;
  accountCode: string;
  accountName: string;
  statementType: string;
  debitAmount: string;
  creditAmount: string;
  balanceAmount: string;
  normalBalance: string;
};

export type TrialBalanceReadModel = {
  tenantId: string;
  entityId?: string;
  asOf: string;
  rows: TrialBalanceLineReadModel[];
  totals: {
    debitAmount: string;
    creditAmount: string;
  };
};

export type TrialBalanceFilters = {
  tenantId: string;
  entityId?: string;
  asOf: string;
};

export type BalanceSheetFilters = {
  tenantId: string;
  entityId?: string;
  asOf: string;
};

export type PeriodStatementFilters = {
  tenantId: string;
  entityId?: string;
  from: string;
  to: string;
};

export type FinancialStatementLineReadModel = {
  lineCode: string;
  lineName: string;
  statementType: string;
  amount: string;
  displayOrder: number;
};

export type FinancialStatementReadModel = {
  tenantId: string;
  entityId?: string;
  statementType: "BS" | "PL" | "CF";
  asOf?: string;
  from?: string;
  to?: string;
  rows: FinancialStatementLineReadModel[];
  totals: {
    amount: string;
  };
};
