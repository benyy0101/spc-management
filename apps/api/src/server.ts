import { postAccountingEvent } from "@spc/application";
import { createDb } from "@spc/db";
import { buildApp } from "./app";
import { createDrizzleAccountingReadRepository } from "./adapters/drizzle-accounting-read-repository";
import { createDrizzleAccountingEventRepository, createDrizzleAuditLogPort } from "./adapters/drizzle-accounting-event-repository";
import { loadConfig } from "./config";

const main = async () => {
  const config = loadConfig();
  const db = createDb(config.databaseUrl);
  const accountingEventRepository = createDrizzleAccountingEventRepository(db);
  const accountingReadRepository = createDrizzleAccountingReadRepository(db);
  const auditLog = createDrizzleAuditLogPort(db);

  const app = buildApp({
    postAccountingEvent: (command) =>
      postAccountingEvent(
        {
          accountingEventRepository,
          auditLog,
        },
        command,
      ),
    listTenants: () => accountingReadRepository.listTenants(),
    listEntities: (tenantId) => accountingReadRepository.listEntities(tenantId),
    listAccounts: (tenantId) => accountingReadRepository.listAccounts(tenantId),
    listStatementMappings: (tenantId) => accountingReadRepository.listStatementMappings(tenantId),
    createStatementMapping: (input) => accountingReadRepository.createStatementMapping(input),
    updateStatementMapping: (tenantId, mappingId, input) =>
      accountingReadRepository.updateStatementMapping(tenantId, mappingId, input),
    listClosePeriods: (filters) => accountingReadRepository.listClosePeriods(filters),
    createClosePeriod: (input) => accountingReadRepository.createClosePeriod(input),
    updateClosePeriodStatus: (tenantId, closePeriodId, input) =>
      accountingReadRepository.updateClosePeriodStatus(tenantId, closePeriodId, input),
    listInvestorPositions: (filters) => accountingReadRepository.listInvestorPositions(filters),
    runAllocations: (input) => accountingReadRepository.runAllocations(input),
    listAllocations: (filters) => accountingReadRepository.listAllocations(filters),
    getAllocationById: (tenantId, allocationId) => accountingReadRepository.getAllocationById(tenantId, allocationId),
    getInvestorAllocationHistory: (tenantId, investorId) =>
      accountingReadRepository.getInvestorAllocationHistory(tenantId, investorId),
    reverseJournal: (input) =>
      import("./adapters/drizzle-accounting-event-repository").then(({ reverseJournal }) => reverseJournal(db, input)),
    reprocessEvent: (input) =>
      import("./adapters/drizzle-accounting-event-repository").then(({ reprocessEvent }) => reprocessEvent(db, input)),
    createManualJournal: (input) =>
      import("./adapters/drizzle-accounting-event-repository").then(({ createManualJournal }) =>
        createManualJournal(db, input),
      ),
    approveJournal: (input) =>
      import("./adapters/drizzle-accounting-event-repository").then(({ approveJournal }) => approveJournal(db, input)),
    listAuditLogs: (filters) => accountingReadRepository.listAuditLogs(filters),
    listProducts: (tenantId) => accountingReadRepository.listProducts(tenantId),
    listContracts: (tenantId) => accountingReadRepository.listContracts(tenantId),
    listEvents: (filters) => accountingReadRepository.listEvents(filters),
    getEventById: (tenantId, eventId) => accountingReadRepository.getEventById(tenantId, eventId),
    getJournalById: (tenantId, journalId) => accountingReadRepository.getJournalById(tenantId, journalId),
    listJournals: (filters) => accountingReadRepository.listJournals(filters),
    getTrialBalance: (filters) => accountingReadRepository.getTrialBalance(filters),
    getBalanceSheet: (filters) => accountingReadRepository.getBalanceSheet(filters),
    getProfitLoss: (filters) => accountingReadRepository.getProfitLoss(filters),
    getCashFlow: (filters) => accountingReadRepository.getCashFlow(filters),
  });

  try {
    await app.listen({
      port: config.port,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void main();
