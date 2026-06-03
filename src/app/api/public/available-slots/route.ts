import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // جلب المواعيد المتاحة المستقلة والقادمة فقط
    const appointments = await prisma.appointment.findMany({
      where: {
        status: "متاح",
        appointmentDatetime: { gte: new Date() }
      },
      orderBy: { appointmentDatetime: 'asc' }
    });

    // تحويل صيغة DateTime المشتركة إلى (Date & Time) لتفهمها شاشة الحجز
    const slots = appointments.map(app => {
      const start = new Date(app.appointmentDatetime);
      const end = new Date(start.getTime() + app.duration * 60000); // إضافة مدة الجلسة بالدقائق
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      return {
        id: app.id,
        date: start.toISOString().split('T')[0],
        startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
        endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      };
    });

    return NextResponse.json(slots, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'فشل في جلب المواعيد المتاحة' }, { status: 500 });
  }
}