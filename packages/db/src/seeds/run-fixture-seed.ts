import { createDb } from "../client";
import { seedCommonMaster, seedScenarioExpectedPosting } from "./fixture-seed";
import {
  COA_FIXTURE_PATH,
  COMMON_FIXTURE_PATH,
  EXCHANGE_RATES_FIXTURE_PATH,
  SCENARIO_FIXTURE_PATHS,
} from "./fixture-paths";

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const run = async () => {
  const db = createDb(requiredEnv("DATABASE_URL"));

  const { tenant, aliasMap } = await seedCommonMaster(
    db,
    COMMON_FIXTURE_PATH,
    COA_FIXTURE_PATH,
    EXCHANGE_RATES_FIXTURE_PATH,
  );

  for (const scenarioPath of SCENARIO_FIXTURE_PATHS) {
    await seedScenarioExpectedPosting(db, scenarioPath, aliasMap, tenant.id);
  }
};

run()
  .then(() => {
    process.stdout.write("Fixture seed completed.\n");
  })
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exit(1);
  });
