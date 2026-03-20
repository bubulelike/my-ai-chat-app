// lib/prisma.ts
// import { PrismaClient } from "../prisma/generated/client";  // 注意导入路径
import { PrismaClient } from "../prisma/generated/client/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import 'dotenv/config'

console.log('=== Initializing Prisma Client ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// 初始化 Driver Adapter
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma 7 必须传入 adapter
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

console.log('Prisma Client initialized successfully');