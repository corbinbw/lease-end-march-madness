# 🚀 Deployment Guide - Lease End Madness

## Quick Vercel Deployment

### 1. Deploy to Vercel

```bash
npx vercel --prod
```

### 2. Database Setup (Neon - Recommended)

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project called "lease-end-madness"
3. Copy the connection string (should look like: `postgresql://username:password@host:port/database`)

### 3. Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=generate-a-secure-secret-key-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
ADMIN_EMAIL=admin@leaseend.com
COMPANY_EMAIL_DOMAIN=leaseend.com
```

### 4. Initialize Database

After deployment, run this locally (connected to production database):

```bash
npx prisma db push
npx prisma db seed
```

### 5. Test

- Visit your Vercel domain
- Try signing in with admin@leaseend.com
- Check that TV display works at `/tv`

## Environment Variables Explained

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:port/db` | PostgreSQL connection |
| `NEXTAUTH_SECRET` | `your-secret-key-123` | Session encryption |
| `NEXTAUTH_URL` | `https://yourapp.vercel.app` | Auth callback URL |
| `ADMIN_EMAIL` | `admin@leaseend.com` | First admin user |
| `COMPANY_EMAIL_DOMAIN` | `leaseend.com` | Email allowlist |

## Testing Checklist

Before going live:

- [ ] Admin can sign in with `ADMIN_EMAIL`
- [ ] Regular users can sign in with company emails
- [ ] Users can make bracket picks
- [ ] TV display shows at `/tv`
- [ ] Mobile interface works
- [ ] Bracket locks work (test with past date)

## Production Notes

- **Email Authentication**: Currently uses magic links (requires SMTP setup for production)
- **Real-time Updates**: Optional Pusher configuration for live updates
- **Performance**: Optimized for 300+ concurrent users
- **Security**: Company email domain restriction, server-side validation

## Support

For issues:
1. Check Vercel build logs
2. Review browser console
3. Test database connectivity
4. Verify environment variables

---

**Ready for March Madness 2026! 🏀**