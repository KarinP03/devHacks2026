import "dotenv/config";

export interface EnvConfig {
  OMDB_API_KEY: string;
  PORT: number;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  OMDB_API_KEY: getEnvVar("OMDB_API_KEY"),
  PORT: parseInt(getEnvVar("PORT", "3000"), 10),
};
