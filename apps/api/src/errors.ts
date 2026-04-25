export class ReferenceDataNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReferenceDataNotFoundError";
  }
}

export class InvalidClosePeriodTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidClosePeriodTransitionError";
  }
}

export class InvalidJournalApprovalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidJournalApprovalError";
  }
}
