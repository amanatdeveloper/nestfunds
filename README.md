# Community Service Management Web App

A full-stack Next.js application for managing local community donations and services (Masjid Fund, Death Committee, Charity).

## Tech Stack

- **Frontend**: Next.js 14/15 (App Router), React, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes & Server Actions
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js (Role-based: ADMIN and MEMBER)

## Features

### Admin Dashboard
- Create/Update/Delete Services
- Member Management
- Transaction Approval (Approve/Reject donations)
- Financial Summary (Total collected vs. pending)
- Death Committee Module

### Member Portal
- View active services/causes
- Submit Donations (with payment proof upload)
- Personal Donation History
- Death Committee Subscriptions

## Project Structure

```
community-app/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── transactions.ts
│   │   └── services.ts
│   ├── api/              # API Routes
│   │   └── auth/
│   ├── admin/            # Admin pages
│   ├── member/           # Member pages
│   ├── auth/             # Authentication pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   └── dashboard-layout.tsx
│   └── providers.tsx
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── next-auth.d.ts
└── public/               # Static assets
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Copy `.env.example` to `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/community_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

3. Generate Prisma Client and push schema:

```bash
npm run db:generate
npm run db:push
```

### 3. Create Initial Admin User

You'll need to create an admin user manually. You can do this via Prisma Studio:

```bash
npm run db:studio
```

Or create a seed script in `prisma/seed.ts` and run it.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Schema

### Models

- **User**: Admin and Member accounts with role-based access
- **Service**: Community services (Masjid Fund, Death Committee, etc.)
- **Transaction**: Donation transactions with approval workflow
- **DeathCommitteeSubscription**: Monthly subscription tracking

## Key Components

### Dashboard Layout

The `DashboardLayout` component provides:
- Responsive sidebar navigation
- Role-based menu items
- User profile display
- Sign out functionality

Usage:
```tsx
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function AdminDashboard() {
  return (
    <DashboardLayout userRole="ADMIN">
      {/* Your page content */}
    </DashboardLayout>
  )
}
```

### Server Actions

#### Transactions
- `createTransaction()` - Submit a donation (Member)
- `updateTransactionStatus()` - Approve/Reject transaction (Admin)
- `getTransactions()` - Fetch transactions with filters
- `getTransactionStats()` - Get transaction statistics

#### Services
- `getActiveServices()` - Get all active services
- `getAllServices()` - Get all services (Admin)
- `createService()` - Create new service (Admin)
- `updateService()` - Update service (Admin)
- `deleteService()` - Delete service (Admin)

## Security Notes

- All server actions include authentication checks
- Role-based access control enforced
- Password hashing with bcryptjs
- Input validation with Zod schemas

## Next Steps

1. Implement file upload for payment proofs (consider using Cloudinary, AWS S3, or local storage)
2. Add email notifications for transaction approvals
3. Implement Death Committee subscription logic
4. Add financial reporting and analytics
5. Create admin member management pages
6. Add pagination for transaction lists
7. Implement search and filtering

## License

MIT

