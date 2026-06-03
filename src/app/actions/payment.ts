'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// مخطط التحقق يطلب caseId (للحفظ) و patientId (لتحديث الواجهة)
const PaymentSchema = z.object({
  caseId: z.string().min(1, "معرف الحالة العلاجية مفقود"),
  patientId: z.string().min(1, "معرف المريض مفقود"),
  amount: z.coerce.number().positive("يجب أن يكون المبلغ رقماً موجباً"),
  notes: z.string().optional(),
});

export type PaymentState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message: string;
} | null;

export async function addPaymentAction(prevState: PaymentState, formData: FormData): Promise<PaymentState> {
  const data = Object.fromEntries(formData.entries());
  const result = PaymentSchema.safeParse(data);

  if (!result.success) {
    return { 
      success: false, 
      errors: result.error.flatten().fieldErrors, 
      message: "بيانات الدفعة غير صالحة" 
    };
  }

  try {
    // ربط الدفعة بـ caseId في قاعدة البيانات
    await prisma.payment.create({
      data: {
        amount: result.data.amount,
        notes: result.data.notes,
        caseId: result.data.caseId,
      },
    });

    // تحديث مسار المريض لتظهر الدفعة فوراً
    revalidatePath(`/patients/${result.data.patientId}`);
    return { success: true, message: "تمت إضافة الدفعة بنجاح" };
  } catch (error) {
    console.error('Error saving payment:', error);
    return { success: false, message: "حدث خطأ أثناء حفظ الدفعة" };
  }
}