import { apiRequest } from "./client";

export type StatementMapping = {
  id: string;
  tenantId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  statementType: "BS" | "PL" | "CF";
  lineCode: string;
  lineName: string;
  displayOrder: number;
};

type StatementMappingListResponse = {
  items: StatementMapping[];
  count: number;
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

export function listStatementMappings(tenantId: string) {
  return apiRequest<StatementMappingListResponse>(
    `/statement-mappings?tenantId=${encodeURIComponent(tenantId)}`,
  );
}

export function createStatementMapping(input: CreateStatementMappingInput) {
  return apiRequest<StatementMapping>("/statement-mappings", {
    method: "POST",
    body: input,
  });
}

export function updateStatementMapping(
  tenantId: string,
  mappingId: string,
  input: UpdateStatementMappingInput,
) {
  return apiRequest<StatementMapping>(
    `/statement-mappings/${encodeURIComponent(mappingId)}?tenantId=${encodeURIComponent(tenantId)}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}
