import Fastify, { type FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { UnsupportedJournalRuleError } from "@spc/domain";
import { ReferenceDataNotFoundError } from "./errors";
import { parsePostAccountingEventCommand } from "./validation";
import type {
  ListAccountsHandler,
  ListContractsHandler,
  ListEntitiesHandler,
  ListTenantsHandler,
  GetEventByIdHandler,
  GetJournalByIdHandler,
  GetTrialBalanceHandler,
  ListEventsHandler,
  ListJournalsHandler,
  ListProductsHandler,
  PostAccountingEventHandler,
} from "./types";

type AppDependencies = {
  postAccountingEvent: PostAccountingEventHandler;
  listTenants: ListTenantsHandler;
  listEntities: ListEntitiesHandler;
  listAccounts: ListAccountsHandler;
  listProducts: ListProductsHandler;
  listContracts: ListContractsHandler;
  listEvents: ListEventsHandler;
  getEventById: GetEventByIdHandler;
  getJournalById: GetJournalByIdHandler;
  listJournals: ListJournalsHandler;
  getTrialBalance: GetTrialBalanceHandler;
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

  return app;
};
