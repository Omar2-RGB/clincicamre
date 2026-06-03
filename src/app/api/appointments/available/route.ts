import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

// إعدادات الـ CORS للسماح لمتصفح فلاتر بالاتصال بالسيرفر بدون حظر
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// دالة التعامل مع طلبات Preflight المبدئية من المتصفح
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    // جلب التاريخ من الرابط إذا كان موجوداً
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // استخدام النوع الصحيح من Prisma بدلاً من any
    const whereClause: Prisma.AppointmentWhereInput = { status: 'متاح' };

    // إذا أرسل تطبيق الفلتر تاريخاً معيناً، نجلب مواعيد هذا اليوم فقط
    if (dateParam) {
      const startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.appointmentDatetime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // جلب البيانات من القاعدة
    const availableAppointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: { appointmentDatetime: 'asc' },
      select: {
        id: true,
        appointmentDatetime: true,
        duration: true,
        status: true,
      } 
    });

    // إرجاع البيانات مع الـ Headers المطلوبة للمتصفح
    return NextResponse.json(
      { success: true, data: availableAppointments }, 
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: 'فشل في جلب المواعيد المتاحة' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}