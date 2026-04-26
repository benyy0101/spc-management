import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "./config";

test("loadConfig prefers DATABASE_URL when present", () => {
  const config = loadConfig({
    PORT: "4000",
    DATABASE_URL: "postgres://user:pass@db.internal:5432/app",
    PGHOST: "ignored-host",
    PGPORT: "5432",
    PGUSER: "ignored-user",
    PGPASSWORD: "ignored-password",
    PGDATABASE: "ignored-db",
  });

  assert.equal(config.port, 4000);
  assert.equal(config.databaseUrl, "postgres://user:pass@db.internal:5432/app");
});

test("loadConfig builds DATABASE_URL from Railway-style PG variables", () => {
  const config = loadConfig({
    PORT: "3000",
    PGHOST: "postgres.railway.internal",
    PGPORT: "5432",
    PGUSER: "user:name",
    PGPASSWORD: "p@ss/word",
    PGDATABASE: "app-db",
  });

  assert.equal(config.port, 3000);
  assert.equal(
    config.databaseUrl,
    "postgres://user%3Aname:p%40ss%2Fword@postgres.railway.internal:5432/app-db",
  );
});

test("loadConfig throws when no database configuration is present", () => {
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: "production",
        PORT: "3000",
      }),
    /DATABASE_URL or PGHOST\/PGPORT\/PGUSER\/PGPASSWORD\/PGDATABASE is required/,
  );
});

test("loadConfig falls back to local database in non-production", () => {
  const config = loadConfig({
    NODE_ENV: "development",
    PORT: "3000",
  });

  assert.equal(config.port, 3000);
  assert.equal(config.databaseUrl, "postgres://postgres:postgres@localhost:5432/spc");
});
