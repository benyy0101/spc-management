const DEFAULT_PORT = 4000;
const DEVELOPMENT_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/spc";

export type ApiConfig = {
  port: number;
  databaseUrl: string;
};

const buildDatabaseUrlFromParts = (env: NodeJS.ProcessEnv): string | undefined => {
  const host = env.PGHOST;
  const port = env.PGPORT;
  const user = env.PGUSER;
  const password = env.PGPASSWORD;
  const database = env.PGDATABASE;

  if (!host || !port || !user || !password || !database) {
    return undefined;
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const encodedDatabase = encodeURIComponent(database);

  return `postgres://${encodedUser}:${encodedPassword}@${host}:${port}/${encodedDatabase}`;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): ApiConfig => {
  const port = Number(env.PORT ?? DEFAULT_PORT);
  const databaseUrl =
    env.DATABASE_URL ??
    buildDatabaseUrlFromParts(env) ??
    (env.NODE_ENV === "production" ? undefined : DEVELOPMENT_DATABASE_URL);

  if (!databaseUrl) {
    throw new Error("DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE is required");
  }

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive number");
  }

  return {
    port,
    databaseUrl,
  };
};
