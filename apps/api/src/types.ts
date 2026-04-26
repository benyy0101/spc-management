import type { PostAccountingEventCommand, PostAccountingEventResult } from "@spc/application";
import type {
  AccountReadModel,
  ApproveJournalInput,
  ApproveJournalResultReadModel,
  AuditLogFilters,
  AuditLogReadModel,
  AllocationListFilters,
  BalanceSheetFilters,
  ClosePeriodListFilters,
  ClosePeriodReadModel,
  ContractReadModel,
  CreateClosePeriodInput,
  CreateEntityInput,
  CreateManualJournalInput,
  CreateStatementMappingInput,
  EntityReadModel,
  EventListFilters,
  EventReadModel,
  FinancialStatementReadModel,
  InvestorAllocationReadModel,
  InvestorPositionFilters,
  InvestorPositionReadModel,
  JournalListFilters,
  ManualJournalResultReadModel,
  JournalReadModel,
  PeriodStatementFilters,
  ProductReadModel,
  ReprocessEventInput,
  ReprocessEventResultReadModel,
  ReverseJournalInput,
  ReverseJournalResultReadModel,
  RunAllocationInput,
  StatementMappingReadModel,
  TenantReadModel,
  TrialBalanceFilters,
  TrialBalanceReadModel,
  UpdateClosePeriodStatusInput,
  UpdateEntityInput,
  UpdateStatementMappingInput,
} from "./read-models";

export type PostAccountingEventHandler = (
  command: PostAccountingEventCommand,
) => Promise<PostAccountingEventResult>;

export type ListTenantsHandler = () => Promise<TenantReadModel[]>;

export type ListEntitiesHandler = (tenantId: string) => Promise<EntityReadModel[]>;

export type CreateEntityHandler = (
  input: CreateEntityInput,
) => Promise<EntityReadModel>;

export type UpdateEntityHandler = (
  tenantId: string,
  entityId: string,
  input: UpdateEntityInput,
) => Promise<EntityReadModel | null>;

export type ListAccountsHandler = (tenantId: string) => Promise<AccountReadModel[]>;

export type ListStatementMappingsHandler = (tenantId: string) => Promise<StatementMappingReadModel[]>;

export type CreateStatementMappingHandler = (
  input: CreateStatementMappingInput,
) => Promise<StatementMappingReadModel>;

export type UpdateStatementMappingHandler = (
  tenantId: string,
  mappingId: string,
  input: UpdateStatementMappingInput,
) => Promise<StatementMappingReadModel | null>;

export type ListClosePeriodsHandler = (
  filters: ClosePeriodListFilters,
) => Promise<ClosePeriodReadModel[]>;

export type CreateClosePeriodHandler = (
  input: CreateClosePeriodInput,
) => Promise<ClosePeriodReadModel>;

export type UpdateClosePeriodStatusHandler = (
  tenantId: string,
  closePeriodId: string,
  input: UpdateClosePeriodStatusInput,
) => Promise<ClosePeriodReadModel | null>;

export type ListInvestorPositionsHandler = (
  filters: InvestorPositionFilters,
) => Promise<InvestorPositionReadModel[]>;

export type RunAllocationsHandler = (
  input: RunAllocationInput,
) => Promise<InvestorAllocationReadModel[]>;

export type ListAllocationsHandler = (
  filters: AllocationListFilters,
) => Promise<InvestorAllocationReadModel[]>;

export type GetAllocationByIdHandler = (
  tenantId: string,
  allocationId: string,
) => Promise<InvestorAllocationReadModel | null>;

export type GetInvestorAllocationHistoryHandler = (
  tenantId: string,
  investorId: string,
) => Promise<InvestorAllocationReadModel[]>;

export type ReverseJournalHandler = (
  input: ReverseJournalInput,
) => Promise<ReverseJournalResultReadModel | null>;

export type ReprocessEventHandler = (
  input: ReprocessEventInput,
) => Promise<ReprocessEventResultReadModel | null>;

export type CreateManualJournalHandler = (
  input: CreateManualJournalInput,
) => Promise<ManualJournalResultReadModel>;

export type ApproveJournalHandler = (
  input: ApproveJournalInput,
) => Promise<ApproveJournalResultReadModel | null>;

export type ListAuditLogsHandler = (
  filters: AuditLogFilters,
) => Promise<AuditLogReadModel[]>;

export type ListProductsHandler = (tenantId: string) => Promise<ProductReadModel[]>;

export type ListContractsHandler = (tenantId: string) => Promise<ContractReadModel[]>;

export type GetEventByIdHandler = (tenantId: string, eventId: string) => Promise<EventReadModel | null>;

export type ListEventsHandler = (filters: EventListFilters) => Promise<EventReadModel[]>;

export type GetJournalByIdHandler = (tenantId: string, journalId: string) => Promise<JournalReadModel | null>;

export type ListJournalsHandler = (filters: JournalListFilters) => Promise<JournalReadModel[]>;

export type GetTrialBalanceHandler = (
  filters: TrialBalanceFilters,
) => Promise<TrialBalanceReadModel>;

export type GetBalanceSheetHandler = (
  filters: BalanceSheetFilters,
) => Promise<FinancialStatementReadModel>;

export type GetProfitLossHandler = (
  filters: PeriodStatementFilters,
) => Promise<FinancialStatementReadModel>;

export type GetCashFlowHandler = (
  filters: PeriodStatementFilters,
) => Promise<FinancialStatementReadModel>;
