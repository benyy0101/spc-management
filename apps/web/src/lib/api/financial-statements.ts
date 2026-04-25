import { apiRequest } from "./client";

export type FinancialStatementLine = {
  lineCode: string;
  lineName: string;
  statementType: "BS" | "PL" | "CF";
  amount: string;
  displayOrder: number;
};

export type FinancialStatementResponse = {
  tenantId: string;
  entityId?: string;
  statementType: "BS" | "PL" | "CF";
  asOf?: string;
  from?: string;
  to?: string;
  rows: FinancialStatementLine[];
  totals: {
    amount: string;
  };
};

function buildQuery(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  return params.toString();
}

export function getBalanceSheet(query: {
  tenantId: string;
  entityId?: string;
  asOf: string;
}) {
  return apiRequest<FinancialStatementResponse>(
    `/financial-statements/balance-sheet?${buildQuery(query)}`,
  );
}

export function getProfitLoss(query: {
  tenantId: string;
  entityId?: string;
  from: string;
  to: string;
}) {
  return apiRequest<FinancialStatementResponse>(
    `/financial-statements/profit-loss?${buildQuery(query)}`,
  );
}

export function getCashFlow(query: {
  tenantId: string;
  entityId?: string;
  from: string;
  to: string;
}) {
  return apiRequest<FinancialStatementResponse>(
    `/financial-statements/cash-flow?${buildQuery(query)}`,
  );
}
