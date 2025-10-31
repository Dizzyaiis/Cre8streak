# Cre8streak MVP 🔥

A gamified accountability platform for social media creators that helps them stay consistent by tracking daily posting streaks, rewarding them with XP points, and ranking them on a leaderboard.

## 🚀 Features

### Implemented in MVP
- ✅ **User Authentication** - Register/Login with username and password, select primary platform
- ✅ **Daily Check-ins** - Manual check-in system to track posting consistency
- ✅ **Streak Tracking** - Real-time tracking of current and best streaks
- ✅ **XP System** - Earn 10 XP per check-in, bonus 20 XP for 7-day milestones
- ✅ **Leaderboard** - Rankings by total XP or longest streaks
- ✅ **Rewards System** - Redeem XP for courses, coaching, and gift cards
- ✅ **Profile Management** - View stats, achievements, and linked platform
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Supported Platforms
- YouTube
- TikTok  
- Facebook
- Instagram
- Threads

## 🏗️ Tech Stack

### Frontend
- **React** 18.3.1 with TypeScript
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and state management
- **Tailwind CSS** - Styling with custom purple/green brand colors
- **shadcn/ui** - Pre-built UI components
- **Vite** - Build tool and dev server

### Backend
- **Express** 4.21.2 - Web framework
- **TypeScript** 5.6.3
- **Express Session** - Session management
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** (Neon) - Relational database
- **Drizzle ORM** - Type-safe database queries
- **ws** - WebSocket support for Neon

## 📊 Database Schema

```
users
├─ id (uuid, primary key)
├─ username (unique)
├─ password (hashed)
├─ displayName
├─ email (optional)
├─ avatarUrl (optional)
├─ primaryPlatform (enum)
├─ xpTotal (integer)
├─ bestStreak (integer)
└─ createdAt

streaks
├─ id (uuid, primary key)
├─ userId (foreign key → users)
├─ platform (enum)
├─ currentStreak (integer)
├─ bestStreak (integer)
├─ lastCheckInDate (date)
├─ streakStartDate (date)
└─ updatedAt

check_ins
├─ id (uuid, primary key)
├─ userId (foreign key → users)
├─ platform (enum)
├─ checkInDate (date)
├─ source (manual | api)
├─ xpAwarded (integer)
└─ createdAt

xp_transactions
├─ id (uuid, primary key)
├─ userId (foreign key → users)
├─ delta (integer)
├─ reason (enum)
├─ metadata (json)
└─ createdAt

rewards
├─ id (uuid, primary key)
├─ title
├─ description
├─ xpCost (integer)
├─ status (active | upcoming | expired)
├─ fulfillmentType (digital | consult | discount | course)
└─ createdAt

redemptions
├─ id (uuid, primary key)
├─ userId (foreign key → users)
├─ rewardId (foreign key → rewards)
├─ xpSpent (integer)
└─ createdAt
```

## 🎨 Architecture

```
┌─────────────────────────────────────────┐
│         React SPA (Frontend)            │
│  ┌────────┬────────┬────────┬────────┐  │
│  │  Home  │Rewards │Profile │Leaders │  │
│  └────────┴────────┴────────┴────────┘  │
│          Authentication Context          │
│          TanStack Query (State)          │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────┐
│         Express Backend (Node)          │
│  ┌──────────────────────────────────┐   │
│  │  Auth Routes  │  API Routes      │   │
│  │  - Register   │  - Dashboard     │   │
│  │  - Login      │  - Check-ins     │   │
│  │  - Logout     │  - Leaderboard   │   │
│  │  - Session    │  - Rewards       │   │
│  └──────────────────────────────────┘   │
│           Storage Layer (Business Logic) │
│  - Streak calculations                   │
│  - XP management                         │
│  - Reward redemption                     │
└──────────────────┬──────────────────────┘
                   │ Drizzle ORM
┌──────────────────▼──────────────────────┐
│       PostgreSQL Database (Neon)        │
│  - Users, Streaks, Check-ins            │
│  - XP Transactions, Rewards             │
└─────────────────────────────────────────┘
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/session` - Get current user

### Dashboard
- `GET /api/me` - Get user dashboard data

### Check-ins
- `POST /api/check-ins` - Record daily check-in
- `GET /api/check-ins` - Get check-in history

### Leaderboard
- `GET /api/leaderboard?metric=xp|streak` - Get top users

### Rewards
- `GET /api/rewards` - List available rewards
- `POST /api/rewards/:id/redeem` - Redeem reward
- `GET /api/redemptions` - User redemption history

### XP
- `GET /api/xp-transactions` - XP transaction history

## 🔧 Environment Variables

Required environment variables:

```bash
DATABASE_URL=postgresql://user:password@host/database
PORT=5000 (default)
SESSION_SECRET=your-secure-random-secret (for production)
NODE_ENV=development|production
```

## 📦 Installation & Setup

1. **Install dependencies**
```bash
npm install
```

2. **Set up database**
```bash
npm run db:push
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at http://localhost:5000

## 🏃 Running on Replit

The app is pre-configured for Replit:
- Database is automatically created
- Environment variables are auto-configured
- Just click "Run" to start the application

## 📱 Usage

1. **Register** - Create an account and select your primary platform
2. **Check In** - Visit the Home page and click "Check In Today" 
3. **Build Streaks** - Check in daily to build your streak
4. **Earn XP** - Get 10 XP per check-in, bonus XP at milestones
5. **Compete** - Climb the leaderboard by earning more XP
6. **Redeem** - Spend XP on courses, coaching, and rewards

## 🎯 Business Logic

### Streak Calculation
- First check-in starts a 1-day streak
- Consecutive daily check-ins increment the streak
- Missing a day resets streak to 0 (on next check-in)
- Best streak is always preserved

### XP Awards
- Base: 10 XP per check-in
- Milestone Bonus: +20 XP every 7 days
- Example: Day 7 = 30 XP, Day 14 = 30 XP

### Achievements (Visual Only)
- Week Warrior: 7-day streak
- Rising Star: 100 total XP
- Champion: 500 total XP
- Consistency King: 30-day streak

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ HTTP-only session cookies
- ✅ CSRF protection via session
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation with Zod schemas
- ✅ Secure session management

## 🎨 Brand Colors

- Primary Purple: `#7c3aed` (purple-600)
- Secondary Green: `#16a34a` (green-600)
- Accent Orange: `#ea580c` (orange-600)
- Backgrounds: Purple-to-green gradients

## 🔮 Future Enhancements

### Phase 2 (Post-MVP)
- [ ] OAuth social login (YouTube, TikTok, Facebook, Instagram)
- [ ] Automatic API integration for real posting detection
- [ ] Push notifications for streak reminders
- [ ] Social features (follow creators, share achievements)
- [ ] Marketplace with real payment processing
- [ ] Analytics dashboard for creators
- [ ] Mobile app (React Native)

### Marketplace Features
- Premium creator courses
- 1-on-1 coaching sessions
- Tools and software discounts
- Exclusive content access
- Pay with XP or real money

## 📄 Files Created

### Backend
- `shared/schema.ts` - Database schema and types
- `server/storage.ts` - Storage layer with business logic
- `server/routes.ts` - API endpoints

### Frontend
- `client/src/lib/auth.tsx` - Authentication context
- `client/src/lib/api.ts` - API hooks
- `client/src/components/Layout.tsx` - Main layout with navigation
- `client/src/pages/auth.tsx` - Login/Register page
- `client/src/pages/Home.tsx` - Dashboard page
- `client/src/pages/Leaderboard.tsx` - Leaderboard page
- `client/src/pages/Rewards.tsx` - Rewards marketplace
- `client/src/pages/Profile.tsx` - User profile page

## 🚀 Deployment to Replit

The app is ready to deploy on Replit:

1. Click the "Publish" button in Replit
2. Your app will be live at `your-repl-name.replit.app`
3. Add a custom domain in Replit settings (optional)

## 🐛 Known Limitations (MVP)

- Manual check-ins only (no API integration yet)
- No real social OAuth (uses simple username/password)
- No payment processing for rewards
- Session storage in memory (use persistent store for production)
- No email verification
- No password reset functionality

## 📝 License

MIT License - Feel free to use and modify for your projects

## 🤝 Contributing

This is an MVP. Future contributions welcome for:
- Social platform API integrations
- Real-time notifications
- Mobile app development
- Payment gateway integration

---

**Built with ❤️ for creators who want to stay consistent**
