# 🏀 Lease End Madness

A production-ready March Madness-style bracket competition web app for Lease End company. Supports 300+ employees, admin controls, real-time TV display, and a **$1,000,000 perfect bracket prize**.

## ✨ Features

- **Complete Bracket System**: 64-person tournament with 4 regions
- **User Management**: Email authentication with company domain allowlist
- **Admin Controls**: Match result entry, bracket locking, user overrides
- **Real-time TV Display**: Live leaderboard and results for office TVs
- **Scoring System**: Configurable point system with perfect bracket tracking
- **Mobile Responsive**: Works on desktop and mobile devices
- **Lock System**: Automatic bracket locking with countdown timer

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Company email domain for authentication

### 1. Clone and Install

```bash
git clone <repository-url>
cd lease-end-madness
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Database (Use Neon, Supabase, or local PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="http://localhost:3000" # Change for production

# Admin Bootstrap
ADMIN_EMAIL="admin@leaseend.com"

# Company Security
COMPANY_EMAIL_DOMAIN="leaseend.com"

# Optional: Real-time updates (Pusher)
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_CLUSTER="us2"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📅 Tournament Schedule

The app includes built-in tournament dates for March 2026:

- **Play-in Round**: March 1-7, 2026
- **Round of 64**: March 9-11, 2026  
- **Round of 32**: March 12-16, 2026
- **Sweet 16**: March 17-19, 2026
- **Elite 8**: March 20-24, 2026
- **Final 4**: March 25-28, 2026
- **Championship**: March 30-April 4, 2026

## 👑 Admin User Guide

### First Time Setup

1. **Login**: Use the email configured in `ADMIN_EMAIL`
2. **Access Admin**: Navigate to `/admin` (admin users see the link)

### Admin Functions

#### Managing Entrants
- **CSV Import**: Upload employee list with columns: `displayName,region,seed,department,title`
- **Manual Entry**: Add individual entrants through the admin interface
- **Edit Entrants**: Modify names, regions, or seeding

#### Bracket Management
- **Generate Matchups**: Auto-create standard tournament bracket
- **Set Lock Time**: Configure when user edits become disabled
- **View All Brackets**: Monitor user picks and progress

#### Enter Results
- **Match Results**: Click to set winners for each matchup
- **Auto-Advancement**: Winners automatically advance to next round
- **Undo Results**: Remove results to make corrections

#### Override Tools
- **User Bracket Override**: Modify any user's picks (with audit log)
- **Unlock Individual**: Temporarily unlock specific brackets
- **Audit Trail**: View all admin actions with timestamps

### CSV Import Format

```csv
displayName,region,seed,department,title
John Doe,IADVISORS,1,Sales,Senior Advisor
Jane Smith,XADVISORS,2,Marketing,Advisor
```

**Region Options**: `IADVISORS`, `XADVISORS`, `FINANCIAL_SPECIALISTS`, `WADVISORS`

## 📺 TV Display

The app includes a dedicated TV display mode at `/tv` featuring:

- **Live Leaderboard**: Top 10 players with real-time updates
- **Perfect Bracket Watch**: Count and names of remaining perfect brackets
- **Recent Results**: Latest match outcomes
- **Region Status**: Current state of each bracket region
- **Auto-rotation**: Views change every 15 seconds
- **Auto-refresh**: Data updates every 30 seconds

**Setup for Office TV:**
1. Open a browser on the TV device
2. Navigate to `your-domain.com/tv`
3. Set browser to fullscreen mode
4. The display will auto-refresh and rotate views

## 🛠️ Deployment

### Option 1: Vercel (Recommended)

1. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

2. **Database Setup:**
   - Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for PostgreSQL
   - Add `DATABASE_URL` to Vercel environment variables

3. **Configure Environment:**
   - Add all environment variables in Vercel dashboard
   - Set `NEXTAUTH_URL` to your domain
   - Update `COMPANY_EMAIL_DOMAIN`

4. **Initialize Database:**
   ```bash
   # After deployment, run migrations
   npx prisma db push
   npx prisma db seed
   ```

### Option 2: Self-Hosted

1. **Build Application:**
   ```bash
   npm run build
   ```

2. **Setup Database:**
   - Install PostgreSQL
   - Create database and user
   - Update `DATABASE_URL`

3. **Run Production:**
   ```bash
   npm start
   ```

## 🎯 Testing Checklist

Before going live, verify:

- [ ] **Authentication**: Users can sign in with company email
- [ ] **Bracket Creation**: New users get automatically created brackets
- [ ] **Pick Making**: Users can select winners and see saves
- [ ] **Lock System**: Picks become read-only after lock time
- [ ] **Admin Controls**: Admin can enter results and override picks
- [ ] **Scoring**: Points calculate correctly after match results
- [ ] **TV Display**: Live view updates and rotates properly
- [ ] **Mobile**: Interface works on phones and tablets
- [ ] **Performance**: App handles 300+ concurrent users

## 🔐 Security Features

- **Email Domain Allowlist**: Only company emails can register
- **Server-side Lock Enforcement**: Cannot bypass lock in browser
- **Admin Action Logging**: All admin changes tracked
- **Input Validation**: Prevents invalid picks and data
- **Session Management**: Secure authentication with NextAuth

## 🎨 Theming & Branding

### Lease End Branding

The app uses Lease End themed colors and language:

- **Primary Colors**: Indigo/Blue gradient
- **Microcopy**: "Own Your Picks", "Lease End Madness"
- **Regions**: Company department names

### Customization

To update branding:

1. **Colors**: Edit Tailwind classes in components
2. **Logo**: Replace placeholder in `navbar.tsx`
3. **Copy**: Update text in component files
4. **Favicon**: Replace `public/favicon.ico`

## 📊 Database Schema

Key tables:
- **Users**: Authentication and roles
- **Entrants**: Tournament participants (employees)
- **Matches**: Tournament bracket structure
- **Brackets**: User bracket instances
- **Picks**: Individual match predictions
- **Settings**: Global configuration
- **AdminActionLog**: Audit trail

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | NextAuth encryption key |
| `NEXTAUTH_URL` | Yes | App URL for auth callbacks |
| `ADMIN_EMAIL` | Yes | First admin user email |
| `COMPANY_EMAIL_DOMAIN` | Yes | Allowed email domain |
| `NEXT_PUBLIC_PUSHER_KEY` | No | Real-time updates (optional) |
| `PUSHER_SECRET` | No | Pusher server key |
| `PUSHER_APP_ID` | No | Pusher application ID |

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**
- Verify `DATABASE_URL` format
- Check database is running and accessible
- Ensure database exists

**Authentication Problems:**
- Confirm `NEXTAUTH_SECRET` is set
- Check `COMPANY_EMAIL_DOMAIN` matches user emails
- Verify `NEXTAUTH_URL` matches your domain

**Lock System Not Working:**
- Ensure server time zone is correct
- Check lock datetime in admin settings
- Verify API routes enforce lock server-side

**TV Display Not Updating:**
- Check `/api/tv-data` returns data
- Verify browser supports JavaScript
- Check for console errors

### Getting Help

1. Check browser console for errors
2. Review server logs for API issues
3. Verify environment variables are set
4. Test with admin user first

## 📝 License

Private software for Lease End company use.

---

**Built for March Madness 2026 🏆**