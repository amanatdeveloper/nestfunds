import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.log('Usage: npm run create:user <email> <password> <name> [role]')
    console.log('Example: npm run create:user admin@test.com 123456 "Admin User" ADMIN')
    console.log('Role can be ADMIN or MEMBER (default: MEMBER)')
    process.exit(1)
  }

  const [email, password, name, role = 'MEMBER'] = args

  if (!['ADMIN', 'MEMBER'].includes(role.toUpperCase())) {
    console.error('Error: Role must be ADMIN or MEMBER')
    process.exit(1)
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`)
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role.toUpperCase() as UserRole,
      },
    })

    console.log('✅ User created successfully!')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
  } catch (error: any) {
    console.error('Error creating user:', error.message)
    process.exit(1)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })

