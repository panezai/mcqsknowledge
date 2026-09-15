import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

function getDatabaseUrl(): string {
  const sourceDbPath = path.resolve(process.cwd(), 'db', 'custom.db')
  const exists = fs.existsSync(sourceDbPath)

  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpDbPath = '/tmp/custom.db'
    try {
      if (exists && (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath)
      }
      return `file:${tmpDbPath}`
    } catch (e) {
      console.error('Failed to copy database to /tmp:', e)
      return `file:${sourceDbPath}?connection_limit=1`
    }
  }

  return `file:${sourceDbPath}`
}

process.env.DATABASE_URL = getDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db