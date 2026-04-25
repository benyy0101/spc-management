export class UnsupportedJournalRuleError extends Error {
  constructor(eventType: string) {
    super(`Unsupported journal rule for event type: ${eventType}`);
    this.name = "UnsupportedJournalRuleError";
  }
}

export class InvalidJournalDraftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidJournalDraftError";
  }
}
