# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and configure:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/community_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
```

### 3. Set Up Database
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Create Admin User
You need to create an admin user manually. Options:

**Option A: Using Prisma Studio**
```bash
npm run db:studio
```
Then manually create a user with:
- Email: admin@example.com
- Password: (hash with bcrypt - see Option B)
- Role: ADMIN

**Option B: Using a seed script**
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  
  console.log('Admin user created!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Then run:
```bash
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with your admin credentials.

## Project Structure Overview

### Core Files Created

1. **Prisma Schema** (`prisma/schema.prisma`)
   - User model with ADMIN/MEMBER roles
   - Service model for community services
   - Transaction model for donations
   - DeathCommitteeSubscription model

2. **Dashboard Layout** (`components/dashboard/dashboard-layout.tsx`)
   - Responsive sidebar navigation
   - Role-based menu items
   - Mobile-friendly design
   - User profile display

3. **Transaction Logic** (`app/actions/transactions.ts`)
   - `createTransaction()` - Submit donation (Member)
   - `updateTransactionStatus()` - Approve/Reject (Admin)
   - `getTransactions()` - Fetch with filters
   - `getTransactionStats()` - Statistics

4. **Service Logic** (`app/actions/services.ts`)
   - `getActiveServices()` - Public/Member
   - `getAllServices()` - Admin
   - `createService()` - Admin
   - `updateService()` - Admin
   - `deleteService()` - Admin

5. **Authentication** (`lib/auth.ts`)
   - NextAuth configuration
   - Credentials provider
   - Role-based session management

## Next Steps

1. **File Upload**: Implement payment proof image upload
   - Consider: Cloudinary, AWS S3, or local storage
   - Update `createTransaction` to handle file uploads

2. **Email Notifications**: Send emails on transaction approval
   - Use: Resend, SendGrid, or Nodemailer

3. **Death Committee Logic**: Implement subscription management
   - Create server actions for monthly subscriptions
   - Add reminder functionality

4. **Member Management**: Build admin member pages
   - List all members
   - View member profiles
   - Edit member details

5. **Financial Reports**: Add reporting features
   - Monthly/yearly summaries
   - Export to PDF/Excel
   - Charts and graphs

## Testing the Application

1. Sign in as admin
2. Create a service (e.g., "Masjid Fund")
3. Sign out and create a member account
4. Sign in as member
5. Submit a donation to the service
6. Sign in as admin
7. Approve the transaction
8. Check the service's current amount

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database exists

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies

### Type Errors
- Run `npm run db:generate` after schema changes
- Restart TypeScript server in your IDE

## Production Deployment

1. Set environment variables in your hosting platform
2. Run database migrations: `npm run db:migrate`
3. Build the application: `npm run build`
4. Start the server: `npm start`

For Vercel deployment:
- Connect your GitHub repository
- Add environment variables
- Vercel will automatically build and deploy

