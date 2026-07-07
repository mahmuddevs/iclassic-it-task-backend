import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value.trim();
}

const getEnv = (key: string, fallback: string): string => {
  const val = process.env[key];
  return val ? val.trim() : fallback;
};


export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  clientUrl: getEnv("CLIENT_URL", "http://localhost:5173"),
  port: Number(getEnv("PORT", "3000")),
  dbUri: `mongodb+srv://${required("DB_USERNAME")}:${required("DB_PASSWORD")}@${required("DB_CLUSTER")}/${required("DB_NAME")}?appName=${required("DB_APP_NAME")}`,
  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  refreshTokenSecret: required("REFRESH_TOKEN_SECRET"),
  accessTokenExpiration: getEnv("ACCESS_TOKEN_EXPIRATION", "15m"),
  refreshTokenExpiration: getEnv("REFRESH_TOKEN_EXPIRATION", "7d"),
  cookieExpirationTime: getEnv("REFRESH_TOKEN_EXPIRATION", "7d"),
  hashSaltRounds: Number(getEnv("HASH_SALT_ROUNDS", "10")),
  cookieSecure: getEnv("NODE_ENV", "development") === "production",
  cookieSameSite: (process.env.SAME_SITE || (getEnv("NODE_ENV", "development") === "production" ? "none" : "lax")) as "none" | "lax" | "strict",
};
