
import { PrismaClient } from "./generated/prisma";
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// Basically what we are doing is that new Prisma client will create new instance whenever we will rebuild or run our app in Dev Mode so for that
// we use the global variable which ensures that prisma client instance is reused during development