export type CurrencyCode = "USD" | "KRW" | string;

export type JournalSide = "debit" | "credit";

export type EventType =
  | "fund_subscription_cash_receipt"
  | "equity_contribution_to_spc"
  | "loan_origination"
  | "borrowing_drawdown"
  | "interest_accrual"
  | "interest_cash_receipt"
  | "principal_repayment"
  | "fair_value_adjustment"
  | "impairment_recognition"
  | "fx_remeasurement"
  | "cash_waterfall_allocation";

export type JournalLineInput = {
  accountCode: string;
  side: JournalSide;
  amount: string;
  currency: CurrencyCode;
  productId?: string;
  contractId?: string;
  counterpartyEntityId?: string;
  investorId?: string;
  description?: string;
};

export type JournalDraft = {
  entityId: string;
  bookCode?: string;
  journalType: string;
  accountingDate: string;
  description?: string;
  lines: JournalLineInput[];
};

export type AccountingEvent = {
  eventId: string;
  eventType: EventType;
  entityId: string;
  bookCode?: string;
  accountingDate: string;
  tradeDate?: string;
  settlementDate?: string;
  currency: CurrencyCode;
  amount: string;
  productId?: string;
  contractId?: string;
  counterpartyEntityId?: string;
  investorId?: string;
  metadata?: Record<string, unknown>;
};

export type JournalGenerationContext = {
  accountingBasis: string;
  baseCurrency: CurrencyCode;
};
