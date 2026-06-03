'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * إنشاء موعد مخصص (متاح للحجز أو محجوز مباشرة لمريض)
 */
export async function createCustomAppointment(
  dateTime: Date,
  patientId?: string,
  type?: string
) {
  try {
    await prisma.appointment.create({
      data: {
        appointmentDatetime: dateTime,
        patientId: patientId || null,
        status: patientId ? 'محجوز' : 'متاح',
        type: type || null,
      },
    });
    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error('فشل إنشاء الموعد');
  }
}

/**
 * حجز موعد متاح مسبقاً لمريض معين
 */
export async function bookAppointment(appointmentId: string, patientId: string, type: string) {
  try {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        patientId: patientId,
        status: 'محجوز',
        type: type,
      },
    });
    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error('فشل حجز الموعد');
  }
}

/**
 * إلغاء حجز موعد وإعادته كـ متاح
 */
export async function cancelAppointment(appointmentId: string) {
  try {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        patientId: null,
        status: 'متاح',
        type: null,
        notes: null,
      },
    });
    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error('فشل إلغاء الموعد');
  }
}

/**
 * حذف الموعد نهائياً من قاعدة البيانات
 */
export async function deleteAppointment(appointmentId: string) {
  try {
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });
    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    // طباعة الخطأ الفعلي في التيرمينال للمطور
    console.error("Prisma Delete Error:", error); 
    // إرجاع حالة الفشل للواجهة بدلاً من تحطيم الصفحة
    return { success: false, message: 'فشل الحذف. قد يكون الموعد مرتبطاً ببيانات أخرى.' };
  }
}
// دالة لتحويل حجز خارجي إلى ملف مريض رسمي
export async function convertGuestToPatient(appointmentId: string, fullName: string, phone: string) {
  try {
    // 1. إنشاء المريض الجديد
    const newPatient = await prisma.patient.create({
      data: {
        fullName,
        phone,
        status: "ACTIVE"
      }
    });

    // 2. ربط الموعد بهذا المريض وتفريغ حقول الزائر
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        patientId: newPatient.id,
        patientName: null, // نمسحه لأنه أصبح مسجلاً كـ patient رسمي
        patientPhone: null,
      }
    });

    // 3. إعادة تحميل الصفحة (تحديث البيانات)
    revalidatePath('/appointments'); 
    return { success: true, patientId: newPatient.id };
  } catch (error) {
    console.error("Error converting guest to patient:", error);
    return { success: false, message: "حدث خطأ أثناء فتح ملف المريض" };
  }
}