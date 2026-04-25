import type { AccountingEvent, JournalDraft, JournalGenerationContext } from "../types";
import { UnsupportedJournalRuleError } from "../errors";
import { credit, debit, validateJournalDraft } from "./helpers";

type RuleFn = (event: AccountingEvent, context: JournalGenerationContext) => JournalDraft[];

const singleJournal = (draft: JournalDraft): JournalDraft[] => {
  validateJournalDraft(draft);
  return [draft];
};

const rules: Record<string, RuleFn> = {
  fund_subscription_cash_receipt: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Fund subscription cash receipt",
      lines: [
        debit("111000", event.amount, {
          currency: event.currency,
          investorId: event.investorId,
        }),
        credit("311000", event.amount, {
          currency: event.currency,
          investorId: event.investorId,
        }),
      ],
    }),

  loan_origination: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Loan origination",
      lines: [
        debit("121000", event.amount, {
          currency: event.currency,
          productId: event.productId,
          contractId: event.contractId,
        }),
        credit("111000", event.amount, {
          currency: event.currency,
          productId: event.productId,
          contractId: event.contractId,
        }),
      ],
    }),

  borrowing_drawdown: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Borrowing drawdown",
      lines: [
        debit("111000", event.amount, { currency: event.currency }),
        credit("211000", event.amount, { currency: event.currency }),
      ],
    }),

  interest_accrual: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Interest accrual",
      lines: [
        debit("131000", event.amount, {
          currency: event.currency,
          productId: event.productId,
          contractId: event.contractId,
        }),
        credit("411000", event.amount, {
          currency: event.currency,
          productId: event.productId,
          contractId: event.contractId,
        }),
      ],
    }),

  interest_cash_receipt: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Interest cash receipt",
      lines: [
        debit("111000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
        credit("131000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
      ],
    }),

  principal_repayment: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Principal repayment",
      lines: [
        debit("111000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
        credit("121000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
      ],
    }),

  fair_value_adjustment: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Fair value adjustment",
      lines: [
        debit("123000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
        credit("421000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
      ],
    }),

  impairment_recognition: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Impairment recognition",
      lines: [
        debit("513000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
        credit("139000", event.amount, {
          currency: event.currency,
          productId: event.productId,
        }),
      ],
    }),

  fx_remeasurement: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "FX remeasurement",
      lines: [
        debit("111000", event.amount, { currency: event.currency }),
        credit("431000", event.amount, { currency: event.currency }),
      ],
    }),

  cash_waterfall_allocation: (event) =>
    singleJournal({
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Cash waterfall allocation",
      lines: [
        debit("111000", event.amount, { currency: event.currency }),
        credit("412000", event.amount, { currency: event.currency }),
      ],
    }),
};

export const generateJournalDrafts = (
  event: AccountingEvent,
  context: JournalGenerationContext,
): JournalDraft[] => {
  if (event.eventType === "equity_contribution_to_spc") {
    const targetEntityId = String(event.metadata?.targetEntityId ?? event.counterpartyEntityId ?? "");
    const targetBookCode = String(event.metadata?.targetBookCode ?? "");

    const fundJournal: JournalDraft = {
      entityId: event.entityId,
      bookCode: event.bookCode,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Equity contribution to SPC - fund side",
      lines: [
        debit("123000", event.amount, {
          currency: event.currency,
          contractId: event.contractId,
          counterpartyEntityId: targetEntityId || undefined,
        }),
        credit("111000", event.amount, {
          currency: event.currency,
          contractId: event.contractId,
          counterpartyEntityId: targetEntityId || undefined,
        }),
      ],
    };

    const spcJournal: JournalDraft = {
      entityId: targetEntityId,
      bookCode: targetBookCode || undefined,
      journalType: "auto",
      accountingDate: event.accountingDate,
      description: "Equity contribution to SPC - spc side",
      lines: [
        debit("111000", event.amount, {
          currency: event.currency,
          contractId: event.contractId,
          counterpartyEntityId: event.entityId,
        }),
        credit("311000", event.amount, {
          currency: event.currency,
          contractId: event.contractId,
          counterpartyEntityId: event.entityId,
        }),
      ],
    };

    validateJournalDraft(fundJournal);
    validateJournalDraft(spcJournal);
    return [fundJournal, spcJournal];
  }

  const rule = rules[event.eventType];
  if (!rule) {
    throw new UnsupportedJournalRuleError(event.eventType);
  }

  return rule(event, context);
};
