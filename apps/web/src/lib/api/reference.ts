import { apiRequest } from "./client";

export type TenantReference = {
  id: string;
  code: string;
  name: string;
  status: string;
  baseCurrency: string;
  accountingTimezone: string;
};

export type EntityReference = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  entityType: string;
  functionalCurrency: string;
  status: string;
};

export type AccountReference = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  accountType: string;
  statementType: string;
  normalBalance: string;
  isActive: boolean;
};

export type ProductReference = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  productType: string;
  currency: string;
  status: string;
};

export type ContractReference = {
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

type ReferenceListResponse<T> = {
  items: T[];
  count: number;
};

export function listTenants() {
  return apiRequest<ReferenceListResponse<TenantReference>>("/tenants");
}

function buildTenantQuery(tenantId: string) {
  return `?tenantId=${encodeURIComponent(tenantId)}`;
}

export function listEntities(tenantId: string) {
  return apiRequest<ReferenceListResponse<EntityReference>>(`/entities${buildTenantQuery(tenantId)}`);
}

export function listAccounts(tenantId: string) {
  return apiRequest<ReferenceListResponse<AccountReference>>(`/accounts${buildTenantQuery(tenantId)}`);
}

export function listProducts(tenantId: string) {
  return apiRequest<ReferenceListResponse<ProductReference>>(`/products${buildTenantQuery(tenantId)}`);
}

export function listContracts(tenantId: string) {
  return apiRequest<ReferenceListResponse<ContractReference>>(`/contracts${buildTenantQuery(tenantId)}`);
}
