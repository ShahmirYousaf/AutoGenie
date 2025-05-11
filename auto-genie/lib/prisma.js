import { PrismaClient } from "./generated/prisma";

// Configure PrismaClient with logging options
export const db = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"], // Log only errors in production
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// Explanation:
// - In development, log warnings and errors to help debug issues.
// - In production, log only errors to avoid excessive logging.