import { apiRequest } from "./client";

export type InvestorPosition = {
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

export type InvestorAllocation = {
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

type ListResponse<T> = {
  items: T[];
  count: number;
};

export type ListInvestorPositionsQuery = {
  tenantId: string;
  fundEntityId?: string;
};

export type ListAllocationsQuery = {
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

function buildQuery(query: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const encoded = searchParams.toString();
  return encoded ? `?${encoded}` : "";
}

export function listInvestorPositions(query: ListInvestorPositionsQuery) {
  return apiRequest<ListResponse<InvestorPosition>>(
    `/investor-positions${buildQuery({
      tenantId: query.tenantId,
      fundEntityId: query.fundEntityId,
    })}`,
  );
}

export function listAllocations(query: ListAllocationsQuery) {
  return apiRequest<ListResponse<InvestorAllocation>>(
    `/allocations${buildQuery({
      tenantId: query.tenantId,
      fundEntityId: query.fundEntityId,
      investorId: query.investorId,
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
    })}`,
  );
}

export function runAllocations(input: RunAllocationInput) {
  return apiRequest<ListResponse<InvestorAllocation>>("/allocations/run", {
    method: "POST",
    body: input,
  });
}

export function getInvestorAllocationHistory(tenantId: string, investorId: string) {
  return apiRequest<ListResponse<InvestorAllocation>>(
    `/investors/${investorId}/allocation-history${buildQuery({ tenantId })}`,
  );
}
