import { PrismaClient } from '@prisma/client'
import path from 'path'

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('/home/z/')) {
  const dbPath = path.resolve(process.cwd(), 'db', 'custom.db')
  process.env.DATABASE_URL = `file:${dbPath}`
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db