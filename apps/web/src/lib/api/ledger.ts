import { apiRequest } from "./client";

export type TrialBalanceResponse = {
  tenantId: string;
  entityId?: string;
  asOf: string;
  rows: Array<{
    accountId: string;
    accountCode: string;
    accountName: string;
    statementType: string;
    debitAmount: string;
    creditAmount: string;
    balanceAmount: string;
    normalBalance: string;
  }>;
  totals: {
    debitAmount: string;
    creditAmount: string;
  };
};

export async function getTrialBalance(query: {
  tenantId: string;
  entityId?: string;
  asOf: string;
}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return apiRequest<TrialBalanceResponse>(`/ledger/trial-balance?${params.toString()}`);
}
