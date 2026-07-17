import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? 30),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  seedAdminName: process.env.SEED_ADMIN_NAME ?? "Administrador",
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@hydrostock.com",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? "admin123",
  appUrl: process.env.APP_URL ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  mailFrom: process.env.SMTP_FROM ?? "TS Sales <no-reply@ts-sales.local>",
};
