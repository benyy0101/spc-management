import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootFixturePath = (...segments: string[]) => resolve(currentDir, "../../../../fixtures", ...segments);

export const COMMON_FIXTURE_PATH = rootFixturePath("master", "common.yaml");
export const COA_FIXTURE_PATH = rootFixturePath("master", "coa.yaml");
export const EXCHANGE_RATES_FIXTURE_PATH = rootFixturePath("master", "exchange-rates.yaml");

export const SCENARIO_FIXTURE_PATHS = [
  rootFixturePath("scenarios", "scenario-001-fund-subscription.yaml"),
  rootFixturePath("scenarios", "scenario-002-fund-to-spc.yaml"),
  rootFixturePath("scenarios", "scenario-003-asset-acquisition.yaml"),
  rootFixturePath("scenarios", "scenario-004-borrowing-drawdown.yaml"),
  rootFixturePath("scenarios", "scenario-005-interest-accrual.yaml"),
  rootFixturePath("scenarios", "scenario-006-interest-receipt.yaml"),
  rootFixturePath("scenarios", "scenario-007-principal-repayment.yaml"),
  rootFixturePath("scenarios", "scenario-008-fair-value-adjustment.yaml"),
  rootFixturePath("scenarios", "scenario-009-impairment.yaml"),
  rootFixturePath("scenarios", "scenario-010-foreign-exchange.yaml"),
  rootFixturePath("scenarios", "scenario-011-cash-waterfall.yaml"),
  rootFixturePath("scenarios", "scenario-012-month-close.yaml"),
  rootFixturePath("scenarios", "scenario-013-investor-allocation.yaml"),
] as const;
