export type FixtureReferencePaths = {
  master_common?: string;
  master_coa?: string;
  exchange_rates?: string;
};

export type CommonMasterFixture = {
  metadata: {
    version: number;
    description: string;
    accounting_standard: string;
    base_currency: string;
    reporting_currencies: string[];
    investor_allocation_method: string;
    cash_flow_statement_method: string;
  };
  entities: Record<
    string,
    {
      id: string;
      code: string;
      name: string;
      type: string;
      functional_currency: string;
    }
  >;
  investors: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    commitment_currency: string;
    commitment_amount?: number;
    paid_in_amount?: number;
    ownership_ratio: number;
  }>;
  products: Array<{
    id: string;
    code: string;
    name: string;
    product_type: string;
    currency: string;
  }>;
  contracts: Array<{
    id: string;
    code: string;
    contract_type: string;
    linked_product_id: string;
    lender_entity_id?: string;
    borrower_name?: string;
    investor_entity_id?: string;
    issuer_entity_id?: string;
    currency: string;
    principal_amount?: number;
    interest_rate_type?: string;
    interest_rate?: number;
    day_count_convention?: string;
    maturity_date?: string;
  }>;
  dimensions: {
    accounting_basis: Array<{ code: string; name: string }>;
    books: Array<{ code: string; entity_id: string }>;
    currencies: string[];
  };
};

export type ScenarioFixture = {
  scenario: {
    id: string;
    code: string;
    name: string;
    description: string;
    accounting_standard: string;
    base_currency: string;
    reporting_currencies?: string[];
    reporting_currency?: string;
    references?: FixtureReferencePaths;
  };
  actors: Record<string, unknown>;
  inputs: Record<string, unknown>;
  expected?: Record<string, unknown>;
  notes?: string[];
};

export type FixtureAliasMap = {
  tenants: Record<string, string>;
  entities: Record<string, string>;
  books: Record<string, string>;
  investors: Record<string, string>;
  products: Record<string, string>;
  contracts: Record<string, string>;
  accounts: Record<string, string>;
  users: Record<string, string>;
};
