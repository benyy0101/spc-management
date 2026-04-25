import type { JournalDraft, JournalLineInput } from "../types";
import { InvalidJournalDraftError } from "../errors";

export const money = (amount: string | number) => Number(amount).toFixed(2);

export const debit = (
  accountCode: string,
  amount: string | number,
  overrides: Omit<JournalLineInput, "accountCode" | "side" | "amount"> & { currency: string },
): JournalLineInput => ({
  accountCode,
  side: "debit",
  amount: money(amount),
  ...overrides,
});

export const credit = (
  accountCode: string,
  amount: string | number,
  overrides: Omit<JournalLineInput, "accountCode" | "side" | "amount"> & { currency: string },
): JournalLineInput => ({
  accountCode,
  side: "credit",
  amount: money(amount),
  ...overrides,
});

export const validateJournalDraft = (draft: JournalDraft) => {
  if (draft.lines.length < 2) {
    throw new InvalidJournalDraftError("Journal draft must have at least two lines");
  }

  const debitTotal = draft.lines
    .filter((line) => line.side === "debit")
    .reduce((sum, line) => sum + Number(line.amount), 0);
  const creditTotal = draft.lines
    .filter((line) => line.side === "credit")
    .reduce((sum, line) => sum + Number(line.amount), 0);

  if (debitTotal.toFixed(2) !== creditTotal.toFixed(2)) {
    throw new InvalidJournalDraftError(
      `Unbalanced journal draft: debit=${debitTotal.toFixed(2)}, credit=${creditTotal.toFixed(2)}`,
    );
  }
};
