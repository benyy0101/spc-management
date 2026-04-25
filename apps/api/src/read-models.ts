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
