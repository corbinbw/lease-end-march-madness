import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if email domain is allowed
      const companyDomain = process.env.COMPANY_EMAIL_DOMAIN
      if (companyDomain && user.email) {
        const emailDomain = user.email.split('@')[1]
        if (emailDomain !== companyDomain) {
          return false
        }
      }
      
      // Create user if doesn't exist, or update existing
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! }
      })
      
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name || user.email!.split('@')[0],
            role: user.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER'
          }
        })
      }
      
      return true
    },
    async session({ session, user }) {
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
        }
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'database'
  }
}