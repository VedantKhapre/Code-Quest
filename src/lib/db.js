import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!globalThis.prisma) {
    // @ts-ignore
    globalThis.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = globalThis.prisma;
}

export default prisma;