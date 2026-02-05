import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 30) + '...',
    NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  }

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    diagnostics.prismaCreated = true

    const result = await prisma.$queryRaw`SELECT 1 as test`
    diagnostics.dbConnected = true
    diagnostics.dbResult = result

    await prisma.$disconnect()
  } catch (error: any) {
    diagnostics.dbError = error.message
    diagnostics.dbErrorName = error.name
    diagnostics.dbErrorCode = error.code
  }

  return NextResponse.json(diagnostics)
}
