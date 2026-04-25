export class ClosedPeriodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClosedPeriodError";
  }
}
