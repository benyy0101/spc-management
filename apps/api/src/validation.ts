import type { PostAccountingEventCommand } from "@spc/application";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0;

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
