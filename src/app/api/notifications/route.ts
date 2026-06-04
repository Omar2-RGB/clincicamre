import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // جلب المواعيد التي تم حجزها خلال الـ 24 ساعة الماضية (كمثال للإشعارات الجديدة)
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5, // جلب أحدث 5 إشعارات فقط لتخفيف الضغط
      // إذا كان لديك جدول للمرضى مرتبط بالموعد، يمكنك جلبه هكذا:
      // include: { patient: true } 
    });

    return NextResponse.json({ 
      success: true, 
      data: recentAppointments 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "فشل جلب الإشعارات" }, { status: 500 });
  }
}