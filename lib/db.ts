import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isEdge = process.env.NEXT_RUNTIME === 'edge'

export const db = isEdge
  ? (null as unknown as PrismaClient)
  : (globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    }))

if (!isEdge && process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db






