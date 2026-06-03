import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// إعداد كائن عام لتخزين الاتصال وتجنب تكراره في بيئة التطوير
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// إعداد المحول (Adapter) وتمرير رابط التطبيق الخاص بـ Supabase
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL! 
})

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // نستخدم المحول الجديد هنا
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma