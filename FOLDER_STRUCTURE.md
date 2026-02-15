# Project Folder Structure

This document outlines the complete folder structure of the Community Service Management Web App.

```
community-app/
├── app/                          # Next.js App Router directory
│   ├── actions/                  # Server Actions (Server-side logic)
│   │   ├── transactions.ts      # Transaction-related server actions
│   │   └── services.ts          # Service-related server actions
│   ├── admin/                    # Admin-only pages
│   │   ├── dashboard/           # Admin dashboard
│   │   │   └── page.tsx
│   │   ├── services/            # Service management
│   │   ├── members/             # Member management
│   │   ├── transactions/        # Transaction approval
│   │   └── death-committee/     # Death committee management
│   ├── member/                   # Member-only pages
│   │   ├── dashboard/           # Member dashboard
│   │   │   └── page.tsx
│   │   ├── services/            # View active services
│   │   ├── donations/           # Donation history
│   │   └── death-committee/     # Death committee subscriptions
│   ├── api/                      # API Routes
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     # NextAuth API handler
│   ├── auth/                     # Authentication pages
│   │   └── signin/
│   │       └── page.tsx          # Sign in page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects based on role)
│   └── globals.css               # Global styles
│
├── components/                    # Reusable React components
│   ├── dashboard/
│   │   └── dashboard-layout.tsx  # Shared dashboard layout
│   └── providers.tsx             # Context providers (SessionProvider)
│
├── lib/                           # Utility libraries
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth configuration
│   └── utils.ts                  # Utility functions
│
├── prisma/                        # Prisma ORM files
│   └── schema.prisma             # Database schema
│
├── types/                         # TypeScript type definitions
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── public/                        # Static assets (images, etc.)
│
├── middleware.ts                  # Next.js middleware (route protection)
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
└── README.md                      # Project documentation
```

## Key Directories Explained

### `/app`
Next.js 14+ App Router directory. All routes are defined by folder structure.

### `/app/actions`
Server Actions for server-side operations. These functions run on the server and can be called directly from client components.

### `/app/admin` & `/app/member`
Role-based route protection. Admin routes are only accessible to ADMIN users, member routes to MEMBER users.

### `/components`
Reusable React components. The `dashboard-layout.tsx` provides a consistent layout for all dashboard pages.

### `/lib`
Utility libraries and configurations:
- `prisma.ts`: Prisma client instance (singleton pattern)
- `auth.ts`: NextAuth configuration
- `utils.ts`: Helper functions

### `/prisma`
Database schema and migrations. Run `npm run db:push` to sync schema with database.

### `/types`
TypeScript type definitions, especially for extending third-party library types.

## Adding New Features

### Adding a New Server Action
1. Create or edit a file in `/app/actions/`
2. Export async functions with `'use server'` directive
3. Include authentication and authorization checks
4. Use Zod for input validation

### Adding a New Page
1. Create a folder in `/app/[route]/`
2. Add a `page.tsx` file
3. Wrap content with `DashboardLayout` if it's a dashboard page
4. Add route protection in `middleware.ts` if needed

### Adding a New Component
1. Create file in `/components/` or appropriate subdirectory
2. Use TypeScript for type safety
3. Follow mobile-responsive design patterns
4. Use Tailwind CSS for styling

