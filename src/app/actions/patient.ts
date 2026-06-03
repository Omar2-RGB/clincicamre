'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// 1. تعريف نوع البيانات التي ستعود من الـ Action
export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message: string;
} | null;

// 2. مخطط التحقق من البيانات
const PatientSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  phone: z.string().min(9, "رقم الهاتف يجب أن يكون 9 أرقام على الأقل"),
  // إضافة البريد الإلكتروني مع السماح بأن يكون فارغاً
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة").optional().or(z.literal('')), 
  age: z.coerce.number().optional().nullable(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

// 3. تحديث الـ Action
export async function createPatientAction(
  prevState: ActionState, 
  formData: FormData
): Promise<ActionState> {
  
  const data = Object.fromEntries(formData.entries());
  const result = PatientSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "يرجى التحقق من البيانات المدخلة",
    };
  }

  try {
    // إنشاء المريض في قاعدة البيانات الجديدة
    await prisma.patient.create({
      data: {
        fullName: result.data.fullName,
        phone: result.data.phone,
        email: result.data.email === '' ? null : result.data.email, // تنظيف الإدخال الفارغ
        age: result.data.age,
        address: result.data.address,
        medicalHistory: result.data.medicalHistory,
        medications: result.data.medications,
        allergies: result.data.allergies,
        notes: result.data.notes,
      },
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return {
      success: false,
      message: "حدث خطأ في قاعدة البيانات. تأكد من صحة المدخلات أو من عدم تكرار البيانات إن وجدت.",
    };
  }

  revalidatePath('/patients');
  redirect('/patients');
}