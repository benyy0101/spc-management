const DEVELOPMENT_API_BASE_URL = "http://localhost:3000";
const PRODUCTION_API_BASE_URL = "https://spcapi-production.up.railway.app";

export const getApiBaseUrl = () => {
  const configuredUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API_BASE_URL;
  }

  return DEVELOPMENT_API_BASE_URL;
};
