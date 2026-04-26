import type { PostAccountingEventCommand } from "@spc/application";
import type {
  ApproveJournalInput,
  CreateManualJournalInput,
  CreateEntityInput,
  ManualJournalLineInput,
  RunAllocationInput,
  CreateClosePeriodInput,
  CreateStatementMappingInput,
  ReprocessEventInput,
  ReverseJournalInput,
  UpdateClosePeriodStatusInput,
  UpdateEntityInput,
  UpdateStatementMappingInput,
} from "./read-models";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0;

const isJournalSide = (value: unknown): value is "debit" | "credit" => value === "debit" || value === "credit";

export const parsePostAccountingEventCommand = (payload: unknown): PostAccountingEventCommand | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { tenantId, actorUserId, accountingBasis, baseCurrency, event } = payload;
  if (!isString(tenantId) || !isString(accountingBasis) || !isString(baseCurrency) || !isRecord(event)) {
    return null;
  }

  if (
    !isString(event.eventId) ||
    !isString(event.eventType) ||
    !isString(event.entityId) ||
    !isString(event.accountingDate) ||
    !isString(event.currency) ||
    !isString(event.amount)
  ) {
    return null;
  }

  return {
    tenantId,
    actorUserId: isString(actorUserId) ? actorUserId : undefined,
    accountingBasis,
    baseCurrency,
    event: {
      eventId: event.eventId,
      eventType: event.eventType as PostAccountingEventCommand["event"]["eventType"],
      entityId: event.entityId,
      bookCode: isString(event.bookCode) ? event.bookCode : undefined,
      accountingDate: event.accountingDate,
      tradeDate: isString(event.tradeDate) ? event.tradeDate : undefined,
      settlementDate: isString(event.settlementDate) ? event.settlementDate : undefined,
      currency: event.currency,
      amount: event.amount,
      productId: isString(event.productId) ? event.productId : undefined,
      contractId: isString(event.contractId) ? event.contractId : undefined,
      counterpartyEntityId: isString(event.counterpartyEntityId) ? event.counterpartyEntityId : undefined,
      investorId: isString(event.investorId) ? event.investorId : undefined,
      metadata: isRecord(event.metadata) ? event.metadata : undefined,
    },
  };
};

export const parseCreateStatementMappingInput = (payload: unknown): CreateStatementMappingInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { tenantId, accountId, statementType, lineCode, lineName, displayOrder } = payload;
  if (
    !isString(tenantId) ||
    !isString(accountId) ||
    !isString(statementType) ||
    !isString(lineCode) ||
    !isString(lineName) ||
    typeof displayOrder !== "number"
  ) {
    return null;
  }

  if (!["BS", "PL", "CF"].includes(statementType)) {
    return null;
  }

  return {
    tenantId,
    accountId,
    statementType: statementType as CreateStatementMappingInput["statementType"],
    lineCode,
    lineName,
    displayOrder,
  };
};

export const parseCreateEntityInput = (payload: unknown): CreateEntityInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { tenantId, code, name, entityType, functionalCurrency, status } = payload;
  if (
    !isString(tenantId) ||
    !isString(code) ||
    !isString(name) ||
    !isString(entityType) ||
    !isString(functionalCurrency)
  ) {
    return null;
  }

  if (!["asset_manager", "fund", "spc", "corporate", "other"].includes(entityType)) {
    return null;
  }

  if (status !== undefined && (!isString(status) || !["active", "inactive"].includes(status))) {
    return null;
  }

  return {
    tenantId,
    code,
    name,
    entityType: entityType as CreateEntityInput["entityType"],
    functionalCurrency,
    status: status as CreateEntityInput["status"] | undefined,
  };
};

export const parseUpdateEntityInput = (payload: unknown): UpdateEntityInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const result: UpdateEntityInput = {};

  if ("code" in payload) {
    if (!isString(payload.code)) {
      return null;
    }
    result.code = payload.code;
  }

  if ("name" in payload) {
    if (!isString(payload.name)) {
      return null;
    }
    result.name = payload.name;
  }

  if ("entityType" in payload) {
    if (!isString(payload.entityType) || !["asset_manager", "fund", "spc", "corporate", "other"].includes(payload.entityType)) {
      return null;
    }
    result.entityType = payload.entityType as UpdateEntityInput["entityType"];
  }

  if ("functionalCurrency" in payload) {
    if (!isString(payload.functionalCurrency)) {
      return null;
    }
    result.functionalCurrency = payload.functionalCurrency;
  }

  if ("status" in payload) {
    if (!isString(payload.status) || !["active", "inactive"].includes(payload.status)) {
      return null;
    }
    result.status = payload.status as UpdateEntityInput["status"];
  }

  return result;
};

export const parseUpdateStatementMappingInput = (payload: unknown): UpdateStatementMappingInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const result: UpdateStatementMappingInput = {};

  if ("lineCode" in payload) {
    if (!isString(payload.lineCode)) {
      return null;
    }
    result.lineCode = payload.lineCode;
  }

  if ("lineName" in payload) {
    if (!isString(payload.lineName)) {
      return null;
    }
    result.lineName = payload.lineName;
  }

  if ("displayOrder" in payload) {
    if (typeof payload.displayOrder !== "number") {
      return null;
    }
    result.displayOrder = payload.displayOrder;
  }

  return result;
};

export const parseCreateClosePeriodInput = (payload: unknown): CreateClosePeriodInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { tenantId, entityId, bookId, periodType, periodStart, periodEnd, status, closedBy } = payload;
  if (
    !isString(tenantId) ||
    !isString(entityId) ||
    !isString(bookId) ||
    !isString(periodType) ||
    !isString(periodStart) ||
    !isString(periodEnd)
  ) {
    return null;
  }

  if (!["month", "quarter", "year"].includes(periodType)) {
    return null;
  }

  if (status !== undefined && (!isString(status) || !["open", "closing", "closed", "reopened"].includes(status))) {
    return null;
  }

  if (closedBy !== undefined && !isString(closedBy)) {
    return null;
  }

  return {
    tenantId,
    entityId,
    bookId,
    periodType: periodType as CreateClosePeriodInput["periodType"],
    periodStart,
    periodEnd,
    status: status as CreateClosePeriodInput["status"] | undefined,
    closedBy,
  };
};

export const parseUpdateClosePeriodStatusInput = (payload: unknown): UpdateClosePeriodStatusInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { status, closedBy } = payload;
  if (!isString(status) || !["open", "closing", "closed", "reopened"].includes(status)) {
    return null;
  }

  if (closedBy !== undefined && !isString(closedBy)) {
    return null;
  }

  return {
    status: status as UpdateClosePeriodStatusInput["status"],
    closedBy,
  };
};

export const parseRunAllocationInput = (payload: unknown): RunAllocationInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { tenantId, fundEntityId, periodStart, periodEnd, method, sourceAmountType, sourceAmount, cashDistributionAmount } =
    payload;
  if (
    !isString(tenantId) ||
    !isString(fundEntityId) ||
    !isString(periodStart) ||
    !isString(periodEnd) ||
    !isString(method) ||
    !isString(sourceAmount)
  ) {
    return null;
  }

  if (method !== "pro_rata") {
    return null;
  }

  if (sourceAmountType !== undefined && sourceAmountType !== "profit") {
    return null;
  }

  if (cashDistributionAmount !== undefined && !isString(cashDistributionAmount)) {
    return null;
  }

  return {
    tenantId,
    fundEntityId,
    periodStart,
    periodEnd,
    method: "pro_rata",
    sourceAmountType: "profit",
    sourceAmount,
    cashDistributionAmount: cashDistributionAmount ?? "0",
  };
};

export const parseReverseJournalInput = (
  tenantId: string,
  journalId: string,
  payload: unknown,
): ReverseJournalInput | null => {
  if (!isString(tenantId) || !isString(journalId)) {
    return null;
  }

  if (payload === undefined || payload === null) {
    return { tenantId, journalId };
  }

  if (!isRecord(payload)) {
    return null;
  }

  const { reversalDate, actorUserId } = payload;
  if (reversalDate !== undefined && !isString(reversalDate)) {
    return null;
  }

  if (actorUserId !== undefined && !isString(actorUserId)) {
    return null;
  }

  return {
    tenantId,
    journalId,
    reversalDate,
    actorUserId,
  };
};

export const parseReprocessEventInput = (
  tenantId: string,
  eventId: string,
  payload: unknown,
): ReprocessEventInput | null => {
  if (!isString(tenantId) || !isString(eventId)) {
    return null;
  }

  if (payload === undefined || payload === null) {
    return { tenantId, eventId };
  }

  if (!isRecord(payload)) {
    return null;
  }

  const { actorUserId } = payload;
  if (actorUserId !== undefined && !isString(actorUserId)) {
    return null;
  }

  return {
    tenantId,
    eventId,
    actorUserId,
  };
};

export const parseApproveJournalInput = (
  tenantId: string,
  journalId: string,
  payload: unknown,
): ApproveJournalInput | null => {
  if (!isString(tenantId) || !isString(journalId)) {
    return null;
  }

  if (payload === undefined || payload === null) {
    return { tenantId, journalId };
  }

  if (!isRecord(payload)) {
    return null;
  }

  const { actorUserId } = payload;
  if (actorUserId !== undefined && !isString(actorUserId)) {
    return null;
  }

  return {
    tenantId,
    journalId,
    actorUserId,
  };
};

const parseManualJournalLine = (value: unknown): ManualJournalLineInput | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { accountCode, side, amount, currency, productId, contractId, counterpartyEntityId, investorId, description } =
    value;
  if (!isString(accountCode) || !isJournalSide(side) || !isString(amount) || !isString(currency)) {
    return null;
  }

  return {
    accountCode,
    side,
    amount,
    currency,
    productId: isString(productId) ? productId : undefined,
    contractId: isString(contractId) ? contractId : undefined,
    counterpartyEntityId: isString(counterpartyEntityId) ? counterpartyEntityId : undefined,
    investorId: isString(investorId) ? investorId : undefined,
    description: isString(description) ? description : undefined,
  };
};

export const parseCreateManualJournalInput = (payload: unknown): CreateManualJournalInput | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const { tenantId, entityId, bookCode, accountingDate, description, actorUserId, lines } = payload;
  if (!isString(tenantId) || !isString(entityId) || !isString(accountingDate) || !Array.isArray(lines) || lines.length < 2) {
    return null;
  }

  const parsedLines = lines.map(parseManualJournalLine);
  if (parsedLines.some((line) => !line)) {
    return null;
  }
  const validLines = parsedLines as ManualJournalLineInput[];

  const debitTotal = validLines
    .filter((line) => line.side === "debit")
    .reduce((sum, line) => sum + Number(line.amount), 0);
  const creditTotal = validLines
    .filter((line) => line.side === "credit")
    .reduce((sum, line) => sum + Number(line.amount), 0);

  if (Math.abs(debitTotal - creditTotal) > 0.000001) {
    return null;
  }

  return {
    tenantId,
    entityId,
    bookCode: isString(bookCode) ? bookCode : undefined,
    accountingDate,
    description: isString(description) ? description : undefined,
    actorUserId: isString(actorUserId) ? actorUserId : undefined,
    lines: validLines,
  };
};
