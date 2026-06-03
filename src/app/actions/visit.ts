'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const VisitSchema = z.object({
  caseId: z.string().min(1, "معرف الحالة مفقود"),
  patientId: z.string().min(1, "معرف المريض مفقود"),
  visitDate: z.string().min(1, "يرجى تحديد تاريخ الجلسة"),
  proceduresDone: z.string().min(2, "يرجى كتابة تفاصيل الإجراءات التي تمت"),
});

export type VisitState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message: string;
} | null;

export async function addVisitAction(prevState: VisitState, formData: FormData): Promise<VisitState> {
  const data = Object.fromEntries(formData.entries());
  const result = VisitSchema.safeParse(data);

  if (!result.success) {
    return { 
      success: false, 
      errors: result.error.flatten().fieldErrors, 
      message: "يرجى التأكد من إدخال كافة تفاصيل الجلسة" 
    };
  }

  try {
    await prisma.visit.create({
      data: {
        visitDate: new Date(result.data.visitDate), // تحويل النص إلى تاريخ
        proceduresDone: result.data.proceduresDone,
        caseId: result.data.caseId,
      },
    });

    // تحديث مسار المريض لتظهر الجلسة فوراً
    revalidatePath(`/patients/${result.data.patientId}`);
    return { success: true, message: "تم تسجيل الجلسة بنجاح" };
  } catch (error) {
    console.error('Error adding visit:', error);
    return { success: false, message: "حدث خطأ أثناء حفظ الجلسة" };
  }
}