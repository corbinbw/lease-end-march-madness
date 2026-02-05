import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check company email domain
    const companyDomain = process.env.COMPANY_EMAIL_DOMAIN
    if (companyDomain) {
      const emailDomain = email.split('@')[1]
      if (emailDomain !== companyDomain) {
        return NextResponse.json(
          { error: `Only @${companyDomain} email addresses are allowed` },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    let user

    if (existingUser) {
      if (existingUser.password) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 400 }
        )
      }
      // User exists from seed but has no password — let them claim it
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
        }
      })
    } else {
      // Create new user
      const isAdmin = email === process.env.ADMIN_EMAIL
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: isAdmin ? 'ADMIN' : 'USER',
        }
      })
    }

    return NextResponse.json({
      message: 'Account created successfully',
      user: { id: user.id, email: user.email, name: user.name }
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
