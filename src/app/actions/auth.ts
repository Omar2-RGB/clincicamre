'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // هنا نبحث عن المستخدم في قاعدة البيانات
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.password === password) { // يجب استخدام bcrypt لمقارنة الباسورد
    (await cookies()).set('session', user.id); // ننشئ جلسة (Cookie)
    return { success: true };
  }
  
  return { success: false, message: "بيانات الدخول غير صحيحة" };
}
// أضف هذا داخل src/app/actions/auth.ts

export async function createUserAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: "البريد وكلمة المرور مطلوبان" };
  }

  try {
    // التحقق مما إذا كان البريد مستخدماً بالفعل
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, message: "هذا البريد الإلكتروني مسجل مسبقاً" };
    }

    // إنشاء المستخدم الجديد (ملاحظة: في الإنتاج يجب تشفير كلمة المرور بـ bcrypt)
    await prisma.user.create({
      data: {
        email,
        password, // لحماية أفضل مستقبلاً استخدم: await bcrypt.hash(password, 10)
        name: "مدير النظام"
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "حدث خطأ في قاعدة البيانات" };
  }
}