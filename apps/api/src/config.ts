const DEFAULT_PORT = 3000;

export type ApiConfig = {
  port: number;
  databaseUrl: string;
};

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): ApiConfig => {
  const port = Number(env.PORT ?? DEFAULT_PORT);
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive number");
  }

  return {
    port,
    databaseUrl,
  };
};
