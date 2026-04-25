import type { AccountingEvent, JournalDraft, JournalGenerationContext } from "../types";
import { generateJournalDrafts } from "../journal-rules/rules";

export const generateJournalsForEvent = (
  event: AccountingEvent,
  context: JournalGenerationContext,
): JournalDraft[] => generateJournalDrafts(event, context);
