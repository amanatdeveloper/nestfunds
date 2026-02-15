# Vercel Deployment Guide

## Environment Variables Required

Vercel dashboard mein yeh environment variables add karo:

### Required Variables:

1. **DATABASE_URL**
   ```
   postgresql://neondb_owner:npg_u1dRXowh6TLO@ep-falling-thunder-a15t5s5u-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

2. **NEXTAUTH_URL**
   ```
   https://your-app-name.vercel.app
   ```
   (Ya jo bhi aapka Vercel domain hai)

3. **NEXTAUTH_SECRET**
   ```
   k3J9+LqTz8N1V7bM0Q2iP4eR1yF6sZ0hG5vN3xJ2kA0=
   ```
   (Ya koi aur strong secret)

## Steps to Deploy:

1. **GitHub Repository Connect:**
   - Vercel dashboard par jao
   - "New Project" click karo
   - GitHub repository select karo: `amanatdeveloper/nestfunds`

2. **Environment Variables Add:**
   - Project settings mein jao
   - "Environment Variables" section mein jao
   - Upar diye gaye 3 variables add karo

3. **Build Settings:**
   - Framework Preset: Next.js (auto-detect)
   - Build Command: `prisma generate && next build` (already set in package.json)
   - Install Command: `npm install`

4. **Deploy:**
   - "Deploy" button click karo
   - Vercel automatically build aur deploy karega

## Important Notes:

- **Prisma Client:** `postinstall` script automatically Prisma client generate karega
- **Database:** Production database URL already set hai
- **Build Time:** First build thoda time le sakta hai (Prisma client generation ke liye)

## After Deployment:

1. Admin user create karo (agar nahi hai):
   ```bash
   npm run create:admin admin@nestfunds.com password "Admin Name"
   ```

2. App test karo:
   - Sign in page check karo
   - Admin dashboard check karo
   - Database connection verify karo

## Troubleshooting:

### Build Fails:
- Check environment variables properly set hain
- Verify DATABASE_URL correct hai
- Check NEXTAUTH_SECRET set hai

### Runtime Errors:
- Check database connection
- Verify Prisma client generated
- Check environment variables in Vercel dashboard

