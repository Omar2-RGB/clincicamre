import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, notes, slotId } = body;

    if (!fullName || !phone || !slotId) {
      return NextResponse.json({ message: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: slotId } });
    if (!appointment || appointment.status !== "متاح") {
      return NextResponse.json({ message: 'الموعد لم يعد متاحاً للحجز' }, { status: 400 });
    }

    // تحديث حالة الموعد وحفظ بيانات المريض الجديد مباشرة في خانات الزوار
    await prisma.appointment.update({
      where: { id: slotId },
      data: {
        status: "محجوز",
        patientName: fullName,
        patientPhone: phone,
        notes: notes ? `[حجز خارجي] - ملاحظة المريض: ${notes}` : '[حجز خارجي من الصفحة العامة]'
      }
    });

    return NextResponse.json({ success: true, message: 'تم الحجز بنجاح' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'حدث خطأ داخلي أثناء معالجة الحجز' }, { status: 500 });
  }
}