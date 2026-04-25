import type { PostAccountingEventCommand, PostAccountingEventResult } from "@spc/application";
import type {
  AccountReadModel,
  ContractReadModel,
  EntityReadModel,
  EventListFilters,
  EventReadModel,
  JournalListFilters,
  JournalReadModel,
  ProductReadModel,
  TenantReadModel,
  TrialBalanceFilters,
  TrialBalanceReadModel,
} from "./read-models";

export type PostAccountingEventHandler = (
  command: PostAccountingEventCommand,
) => Promise<PostAccountingEventResult>;

export type ListTenantsHandler = () => Promise<TenantReadModel[]>;

export type ListEntitiesHandler = (tenantId: string) => Promise<EntityReadModel[]>;

export type ListAccountsHandler = (tenantId: string) => Promise<AccountReadModel[]>;

export type ListProductsHandler = (tenantId: string) => Promise<ProductReadModel[]>;

export type ListContractsHandler = (tenantId: string) => Promise<ContractReadModel[]>;

export type GetEventByIdHandler = (tenantId: string, eventId: string) => Promise<EventReadModel | null>;

export type ListEventsHandler = (filters: EventListFilters) => Promise<EventReadModel[]>;

export type GetJournalByIdHandler = (tenantId: string, journalId: string) => Promise<JournalReadModel | null>;

export type ListJournalsHandler = (filters: JournalListFilters) => Promise<JournalReadModel[]>;

export type GetTrialBalanceHandler = (
  filters: TrialBalanceFilters,
) => Promise<TrialBalanceReadModel>;
