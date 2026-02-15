import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing user passwords...\n')

  // Update admin@admin.com
  const hashedPassword1 = await bcrypt.hash('123456', 10)
  const user1 = await prisma.user.update({
    where: { email: 'admin@admin.com' },
    data: { password: hashedPassword1 },
  })
  console.log('✅ Updated password for admin@admin.com')

  // Update awais@a.com
  const hashedPassword2 = await bcrypt.hash('123456', 10)
  const user2 = await prisma.user.update({
    where: { email: 'awais@a.com' },
    data: { password: hashedPassword2 },
  })
  console.log('✅ Updated password for awais@a.com')

  console.log('\n✅ All passwords have been hashed successfully!')
  console.log('You can now login with:')
  console.log('  - admin@admin.com / 123456')
  console.log('  - awais@a.com / 123456')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

