import Fastify, { type FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { ClosedPeriodError } from "@spc/application";
import { UnsupportedJournalRuleError } from "@spc/domain";
import {
  InvalidClosePeriodTransitionError,
  InvalidJournalApprovalError,
  ReferenceDataNotFoundError,
} from "./errors";
import {
  parseApproveJournalInput,
  parseCreateManualJournalInput,
  parseCreateClosePeriodInput,
  parseCreateStatementMappingInput,
  parsePostAccountingEventCommand,
  parseReprocessEventInput,
  parseReverseJournalInput,
  parseRunAllocationInput,
  parseUpdateClosePeriodStatusInput,
  parseUpdateStatementMappingInput,
} from "./validation";
import type {
  GetAllocationByIdHandler,
  ApproveJournalHandler,
  GetInvestorAllocationHistoryHandler,
  ListAuditLogsHandler,
  CreateManualJournalHandler,
  CreateClosePeriodHandler,
  CreateStatementMappingHandler,
  GetBalanceSheetHandler,
  GetCashFlowHandler,
  GetEventByIdHandler,
  GetJournalByIdHandler,
  GetProfitLossHandler,
  GetTrialBalanceHandler,
  ListAccountsHandler,
  ListAllocationsHandler,
  ListClosePeriodsHandler,
  ListContractsHandler,
  ListEntitiesHandler,
  ListEventsHandler,
  ListInvestorPositionsHandler,
  ListJournalsHandler,
  ListProductsHandler,
  ListStatementMappingsHandler,
  ListTenantsHandler,
  PostAccountingEventHandler,
  ReprocessEventHandler,
  ReverseJournalHandler,
  RunAllocationsHandler,
  UpdateClosePeriodStatusHandler,
  UpdateStatementMappingHandler,
} from "./types";

type AppDependencies = {
  postAccountingEvent: PostAccountingEventHandler;
  listTenants: ListTenantsHandler;
  listEntities: ListEntitiesHandler;
  listAccounts: ListAccountsHandler;
  listStatementMappings: ListStatementMappingsHandler;
  createStatementMapping: CreateStatementMappingHandler;
  updateStatementMapping: UpdateStatementMappingHandler;
  listClosePeriods: ListClosePeriodsHandler;
  createClosePeriod: CreateClosePeriodHandler;
  updateClosePeriodStatus: UpdateClosePeriodStatusHandler;
  listInvestorPositions: ListInvestorPositionsHandler;
  runAllocations: RunAllocationsHandler;
  listAllocations: ListAllocationsHandler;
  getAllocationById: GetAllocationByIdHandler;
  getInvestorAllocationHistory: GetInvestorAllocationHistoryHandler;
  reverseJournal: ReverseJournalHandler;
  reprocessEvent: ReprocessEventHandler;
  createManualJournal: CreateManualJournalHandler;
  approveJournal: ApproveJournalHandler;
  listAuditLogs: ListAuditLogsHandler;
  listProducts: ListProductsHandler;
  listContracts: ListContractsHandler;
  listEvents: ListEventsHandler;
  getEventById: GetEventByIdHandler;
  getJournalById: GetJournalByIdHandler;
  listJournals: ListJournalsHandler;
  getTrialBalance: GetTrialBalanceHandler;
  getBalanceSheet: GetBalanceSheetHandler;
  getProfitLoss: GetProfitLossHandler;
  getCashFlow: GetCashFlowHandler;
};

export const buildApp = (deps: AppDependencies): FastifyInstance => {
  const app = Fastify({
    logger: false,
  });

  void app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "SPC Accounting API",
        version: "0.1.0",
      },
    },
  });

  void app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  app.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      status: "ok",
    }),
  );

  app.post(
    "/accounting-events",
    {
      schema: {
        tags: ["events"],
        summary: "Post an accounting event and generate journals",
        body: {
          type: "object",
          required: ["tenantId", "accountingBasis", "baseCurrency", "event"],
          properties: {
            tenantId: { type: "string", format: "uuid" },
            actorUserId: { type: "string", format: "uuid" },
            accountingBasis: { type: "string" },
            baseCurrency: { type: "string" },
            event: {
              type: "object",
              required: ["eventId", "eventType", "entityId", "accountingDate", "currency", "amount"],
              properties: {
                eventId: { type: "string" },
                eventType: { type: "string" },
                entityId: { type: "string", format: "uuid" },
                bookCode: { type: "string" },
                accountingDate: { type: "string", format: "date" },
                tradeDate: { type: "string", format: "date" },
                settlementDate: { type: "string", format: "date" },
                currency: { type: "string" },
                amount: { type: "string" },
                productId: { type: "string", format: "uuid" },
                contractId: { type: "string", format: "uuid" },
                counterpartyEntityId: { type: "string", format: "uuid" },
                investorId: { type: "string", format: "uuid" },
                metadata: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const command = parsePostAccountingEventCommand(request.body);
      if (!command) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request body does not match PostAccountingEventCommand",
        });
      }

      try {
        const result = await deps.postAccountingEvent(command);
        return reply.code(result.skippedAsDuplicate ? 200 : 201).send(result);
      } catch (error) {
        if (error instanceof UnsupportedJournalRuleError) {
          return reply.code(400).send({
            error: "unsupported_journal_rule",
            message: error.message,
          });
        }

        if (error instanceof ReferenceDataNotFoundError) {
          return reply.code(404).send({
            error: "reference_not_found",
            message: error.message,
          });
        }

        if (error instanceof ClosedPeriodError) {
          return reply.code(409).send({
            error: "closed_period",
            message: error.message,
          });
        }

        request.log.error(error);
        return reply.code(500).send({
          error: "internal_server_error",
        });
      }
    },
  );

  app.get(
    "/tenants",
    {
      schema: {
        tags: ["reference"],
        summary: "List tenants",
      },
    },
    async (_request, reply) => {
      const rows = await deps.listTenants();
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.get(
    "/entities",
    {
      schema: {
        tags: ["reference"],
        summary: "List entities",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listEntities(tenantId);
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.get(
    "/accounts",
    {
      schema: {
        tags: ["reference"],
        summary: "List chart of accounts",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listAccounts(tenantId);
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.get(
    "/statement-mappings",
    {
      schema: {
        tags: ["reference"],
        summary: "List statement mappings",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listStatementMappings(tenantId);
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.post(
    "/statement-mappings",
    {
      schema: {
        tags: ["reference"],
        summary: "Create a statement mapping",
      },
    },
    async (request, reply) => {
      const input = parseCreateStatementMappingInput(request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request body does not match CreateStatementMappingInput",
        });
      }

      const mapping = await deps.createStatementMapping(input);
      return reply.code(201).send(mapping);
    },
  );

  app.patch(
    "/statement-mappings/:id",
    {
      schema: {
        tags: ["reference"],
        summary: "Update a statement mapping",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const input = parseUpdateStatementMappingInput(request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request body does not match UpdateStatementMappingInput",
        });
      }

      const mappingId = (request.params as { id?: string }).id;
      if (!mappingId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "id path parameter is required",
        });
      }

      const updated = await deps.updateStatementMapping(tenantId, mappingId, input);
      if (!updated) {
        return reply.code(404).send({
          error: "not_found",
          message: "Statement mapping not found",
        });
      }

      return reply.send(updated);
    },
  );

  app.get(
    "/close-periods",
    {
      schema: {
        tags: ["close"],
        summary: "List close periods",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        entityId?: string;
        bookId?: string;
        status?: "open" | "closing" | "closed" | "reopened";
      };
      if (!query.tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listClosePeriods({
        tenantId: query.tenantId,
        entityId: query.entityId,
        bookId: query.bookId,
        status: query.status,
      });
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.post(
    "/close-periods",
    {
      schema: {
        tags: ["close"],
        summary: "Create a close period record",
      },
    },
    async (request, reply) => {
      const input = parseCreateClosePeriodInput(request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request body does not match CreateClosePeriodInput",
        });
      }

      const closePeriod = await deps.createClosePeriod(input);
      return reply.code(201).send(closePeriod);
    },
  );

  app.patch(
    "/close-periods/:id/status",
    {
      schema: {
        tags: ["close"],
        summary: "Transition close period status",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const input = parseUpdateClosePeriodStatusInput(request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request body does not match UpdateClosePeriodStatusInput",
        });
      }

      const closePeriodId = (request.params as { id?: string }).id;
      if (!closePeriodId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "id path parameter is required",
        });
      }

      try {
        const updated = await deps.updateClosePeriodStatus(tenantId, closePeriodId, input);
        if (!updated) {
          return reply.code(404).send({
            error: "not_found",
            message: "Close period not found",
          });
        }

        return reply.send(updated);
      } catch (error) {
        if (error instanceof InvalidClosePeriodTransitionError) {
          return reply.code(409).send({
            error: "invalid_close_period_transition",
            message: error.message,
          });
        }

        throw error;
      }
    },
  );

  app.get(
    "/investor-positions",
    {
      schema: {
        tags: ["allocations"],
        summary: "List investor positions",
      },
    },
    async (request, reply) => {
      const query = request.query as { tenantId?: string; fundEntityId?: string };
      if (!query.tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listInvestorPositions({
        tenantId: query.tenantId,
        fundEntityId: query.fundEntityId,
      });
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.post(
    "/allocations/run",
    {
      schema: {
        tags: ["allocations"],
        summary: "Run investor allocations",
      },
    },
    async (request, reply) => {
      const input = parseRunAllocationInput(request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request body does not match RunAllocationInput",
        });
      }

      const rows = await deps.runAllocations(input);
      return reply.code(201).send({ items: rows, count: rows.length });
    },
  );

  app.get(
    "/allocations",
    {
      schema: {
        tags: ["allocations"],
        summary: "List allocation results",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        fundEntityId?: string;
        investorId?: string;
        periodStart?: string;
        periodEnd?: string;
      };
      if (!query.tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listAllocations({
        tenantId: query.tenantId,
        fundEntityId: query.fundEntityId,
        investorId: query.investorId,
        periodStart: query.periodStart,
        periodEnd: query.periodEnd,
      });
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.get(
    "/allocations/:id",
    {
      schema: {
        tags: ["allocations"],
        summary: "Get one allocation row",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const allocationId = (request.params as { id?: string }).id;
      if (!allocationId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "id path parameter is required",
        });
      }

      const row = await deps.getAllocationById(tenantId, allocationId);
      if (!row) {
        return reply.code(404).send({
          error: "not_found",
          message: "Allocation not found",
        });
      }

      return reply.send(row);
    },
  );

  app.get(
    "/investors/:id/allocation-history",
    {
      schema: {
        tags: ["allocations"],
        summary: "Get investor allocation history",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const investorId = (request.params as { id?: string }).id;
      if (!investorId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "id path parameter is required",
        });
      }

      const rows = await deps.getInvestorAllocationHistory(tenantId, investorId);
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.post(
    "/journals/:id/reverse",
    {
      schema: {
        tags: ["operations"],
        summary: "Reverse a posted journal",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      const journalId = (request.params as { id?: string }).id;
      const input = parseReverseJournalInput(tenantId ?? "", journalId ?? "", request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request does not match ReverseJournalInput",
        });
      }

      const result = await deps.reverseJournal(input);
      if (!result) {
        return reply.code(404).send({
          error: "not_found",
          message: "Journal not found or already reversed",
        });
      }

      return reply.send(result);
    },
  );

  app.post(
    "/journals/manual",
    {
      schema: {
        tags: ["operations"],
        summary: "Create a manual journal",
      },
    },
    async (request, reply) => {
      const input = parseCreateManualJournalInput(request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request does not match CreateManualJournalInput",
        });
      }

      const result = await deps.createManualJournal(input);
      return reply.code(201).send(result);
    },
  );

  app.post(
    "/journals/:id/approve",
    {
      schema: {
        tags: ["journals"],
        summary: "Approve a draft journal",
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id?: string };
      const { tenantId } = request.query as { tenantId?: string };
      const input = parseApproveJournalInput(tenantId ?? "", id ?? "", request.body);

      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request body does not match ApproveJournalInput",
        });
      }

      try {
        const result = await deps.approveJournal(input);
        if (!result) {
          return reply.code(404).send({
            error: "not_found",
            message: `Journal ${input.journalId} not found`,
          });
        }

        return reply.send(result);
      } catch (error) {
        if (error instanceof InvalidJournalApprovalError) {
          return reply.code(409).send({
            error: "invalid_journal_transition",
            message: error.message,
          });
        }

        request.log.error(error);
        return reply.code(500).send({
          error: "internal_server_error",
        });
      }
    },
  );

  app.get(
    "/audit-logs",
    {
      schema: {
        tags: ["operations"],
        summary: "List audit logs",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        actionType?: string;
        resourceType?: string;
        resourceId?: string;
      };
      if (!query.tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listAuditLogs({
        tenantId: query.tenantId,
        actionType: query.actionType,
        resourceType: query.resourceType,
        resourceId: query.resourceId,
      });
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.post(
    "/events/:id/reprocess",
    {
      schema: {
        tags: ["operations"],
        summary: "Reverse active journals and regenerate them from the source event",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      const eventId = (request.params as { id?: string }).id;
      const input = parseReprocessEventInput(tenantId ?? "", eventId ?? "", request.body);
      if (!input) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "Request does not match ReprocessEventInput",
        });
      }

      const result = await deps.reprocessEvent(input);
      if (!result) {
        return reply.code(404).send({
          error: "not_found",
          message: "Event not found",
        });
      }

      return reply.send(result);
    },
  );

  app.get(
    "/products",
    {
      schema: {
        tags: ["reference"],
        summary: "List products",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listProducts(tenantId);
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.get(
    "/contracts",
    {
      schema: {
        tags: ["reference"],
        summary: "List contracts",
      },
    },
    async (request, reply) => {
      const tenantId = (request.query as { tenantId?: string }).tenantId;
      if (!tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listContracts(tenantId);
      return reply.send({ items: rows, count: rows.length });
    },
  );

  app.get(
    "/events",
    {
      schema: {
        tags: ["events"],
        summary: "List accounting events",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        entityId?: string;
        eventType?: string;
        status?: string;
        from?: string;
        to?: string;
      };

      if (!query.tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listEvents({
        tenantId: query.tenantId,
        entityId: query.entityId,
        eventType: query.eventType,
        status: query.status,
        from: query.from,
        to: query.to,
      });

      return reply.send({
        items: rows,
        count: rows.length,
      });
    },
  );

  app.get(
    "/events/:id",
    {
      schema: {
        tags: ["events"],
        summary: "Get one accounting event",
      },
    },
    async (request, reply) => {
      const params = request.params as { id?: string };
      const tenantId = (request.query as { tenantId?: string }).tenantId;

      if (!tenantId || !params.id) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query and event id path parameter are required",
        });
      }

      const event = await deps.getEventById(tenantId, params.id);
      if (!event) {
        return reply.code(404).send({
          error: "not_found",
        });
      }

      return reply.send(event);
    },
  );

  app.get(
    "/journals/:id",
    {
      schema: {
        tags: ["journals"],
        summary: "Get one journal with lines",
      },
    },
    async (request, reply) => {
      const params = request.params as { id?: string };
      const tenantId = (request.query as { tenantId?: string }).tenantId;

      if (!tenantId || !params.id) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query and journal id path parameter are required",
        });
      }

      const journal = await deps.getJournalById(tenantId, params.id);
      if (!journal) {
        return reply.code(404).send({
          error: "not_found",
        });
      }

      return reply.send(journal);
    },
  );

  app.get(
    "/journals",
    {
      schema: {
        tags: ["journals"],
        summary: "List journals",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        entityId?: string;
        from?: string;
        to?: string;
      };

      if (!query.tenantId) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId query parameter is required",
        });
      }

      const rows = await deps.listJournals({
        tenantId: query.tenantId,
        entityId: query.entityId,
        from: query.from,
        to: query.to,
      });

      return reply.send({
        items: rows,
        count: rows.length,
      });
    },
  );

  app.get(
    "/ledger/trial-balance",
    {
      schema: {
        tags: ["ledger"],
        summary: "Get trial balance as of a date",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        entityId?: string;
        asOf?: string;
      };

      if (!query.tenantId || !query.asOf) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId and asOf query parameters are required",
        });
      }

      const trialBalance = await deps.getTrialBalance({
        tenantId: query.tenantId,
        entityId: query.entityId,
        asOf: query.asOf,
      });

      return reply.send(trialBalance);
    },
  );

  app.get(
    "/financial-statements/balance-sheet",
    {
      schema: {
        tags: ["financial-statements"],
        summary: "Get balance sheet as of a date",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        entityId?: string;
        asOf?: string;
      };

      if (!query.tenantId || !query.asOf) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId and asOf query parameters are required",
        });
      }

      const statement = await deps.getBalanceSheet({
        tenantId: query.tenantId,
        entityId: query.entityId,
        asOf: query.asOf,
      });

      return reply.send(statement);
    },
  );

  app.get(
    "/financial-statements/profit-loss",
    {
      schema: {
        tags: ["financial-statements"],
        summary: "Get profit and loss for a period",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        entityId?: string;
        from?: string;
        to?: string;
      };

      if (!query.tenantId || !query.from || !query.to) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId, from, and to query parameters are required",
        });
      }

      const statement = await deps.getProfitLoss({
        tenantId: query.tenantId,
        entityId: query.entityId,
        from: query.from,
        to: query.to,
      });

      return reply.send(statement);
    },
  );

  app.get(
    "/financial-statements/cash-flow",
    {
      schema: {
        tags: ["financial-statements"],
        summary: "Get cash flow for a period",
      },
    },
    async (request, reply) => {
      const query = request.query as {
        tenantId?: string;
        entityId?: string;
        from?: string;
        to?: string;
      };

      if (!query.tenantId || !query.from || !query.to) {
        return reply.code(400).send({
          error: "invalid_request",
          message: "tenantId, from, and to query parameters are required",
        });
      }

      const statement = await deps.getCashFlow({
        tenantId: query.tenantId,
        entityId: query.entityId,
        from: query.from,
        to: query.to,
      });

      return reply.send(statement);
    },
  );

  return app;
};
