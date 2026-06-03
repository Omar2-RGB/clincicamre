'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createNewCase(formData: FormData) {
  const patientId = formData.get('patientId') as string;

  if (!patientId) {
    throw new Error('معرف المريض مفقود');
  }

  try {
    // إنشاء حالة جديدة وربطها بالمريض
    await prisma.case.create({
      data: {
        patientId: patientId,
        status: 'جاري', // الحالة الافتراضية
        totalCost: 0,
        // يمكنك لاحقاً إضافة حقول أخرى كبداية افتراضية
      },
    });

    // إعادة تحديث الصفحة لتختفي رسالة "لا توجد حالة" وتظهر لوحة التحكم
    revalidatePath(`/patients/${patientId}`);
  } catch (error) {
    console.error('Error creating new case:', error);
    throw new Error('حدث خطأ أثناء إنشاء الحالة الجديدة');
  }
}
// أضف هذا الكود في أسفل ملف src/app/actions/case.ts

import { z } from 'zod';

// مخطط التحقق من البيانات
const UpdateCaseSchema = z.object({
  caseId: z.string().min(1, "معرف الحالة مفقود"),
  patientId: z.string().min(1, "معرف المريض مفقود"),
  treatmentPlan: z.string().optional(),
  totalCost: z.coerce.number().min(0, "يجب أن تكون التكلفة صفراً أو أكثر"),
});

export type CaseState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message: string;
} | null;

export async function updateCaseDetailsAction(prevState: CaseState, formData: FormData): Promise<CaseState> {
  const data = Object.fromEntries(formData.entries());
  const result = UpdateCaseSchema.safeParse(data);

  if (!result.success) {
    return { 
      success: false, 
      errors: result.error.flatten().fieldErrors, 
      message: "يرجى التحقق من البيانات المدخلة" 
    };
  }

  try {
    await prisma.case.update({
      where: { id: result.data.caseId },
      data: {
        treatmentPlan: result.data.treatmentPlan,
        totalCost: result.data.totalCost,
      },
    });

    revalidatePath(`/patients/${result.data.patientId}`);
    return { success: true, message: "تم تحديث خطة العلاج بنجاح" };
  } catch (error) {
    console.error('Error updating case:', error);
    return { success: false, message: "حدث خطأ أثناء حفظ التعديلات" };
  }
}