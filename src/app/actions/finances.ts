'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createExpense(amount: number, category: string, description: string) {
  try {
    await prisma.expense.create({
      data: {
        amount,
        category,
        description,
        expenseDate: new Date()
      }
    });
    
    // تحديث صفحة المالية فوراً بعد إضافة المصروف
    revalidatePath('/finances');
    return { success: true };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, message: "حدث خطأ أثناء تسجيل المصروف" };
  }
  
}
export async function getFinancialReport() {
  const months = 6;
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [income, expense] = await Promise.all([
      prisma.payment.aggregate({
        where: { paymentDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { expenseDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
      })
    ]);

    data.push({
      month: startOfMonth.toLocaleDateString('ar-EG', { month: 'short' }),
      إيرادات: income._sum.amount || 0,
      مصروفات: expense._sum.amount || 0,
    });
  }
  return data;
}