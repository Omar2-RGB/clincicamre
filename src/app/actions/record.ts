'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addDentalRecordAction(
  caseId: string, 
  patientId: string, 
  imageUrl: string, // تم التعديل هنا
  fileType: string, 
  phase: string
) {
  if (!caseId || !imageUrl) {
    return { success: false, message: "بيانات الصورة غير مكتملة" };
  }

  try {
    await prisma.dentalRecord.create({
      data: {
        caseId,
        imageUrl, // تم التعديل هنا
        fileType,
        phase,
      },
    });

    revalidatePath(`/patients/${patientId}`);
    return { success: true, message: "تم حفظ الصورة بنجاح" };
  } catch (error) {
    console.error('Error saving dental record:', error);
    return { success: false, message: "حدث خطأ أثناء حفظ بيانات الصورة" };
  }
}