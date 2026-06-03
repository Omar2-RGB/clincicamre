import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    // قراءة البيانات القادمة من تطبيق الفلتر
    const body = await request.json();
    const { appointmentId, patientId, type } = body;

    // التحقق من وجود البيانات الأساسية
    if (!appointmentId || !patientId) {
      return NextResponse.json(
        { success: false, message: 'البيانات غير مكتملة' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // التأكد من أن الموعد ما زال متاحاً (تجنب الحجز المزدوج)
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!existingAppointment || existingAppointment.status !== 'متاح') {
      return NextResponse.json(
        { success: false, message: 'عذراً، هذا الموعد لم يعد متاحاً' }, 
        { status: 409, headers: corsHeaders }
      );
    }

    // تحديث الموعد ليصبح محجوزاً باسم المريض
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        patientId: patientId,
        status: 'محجوز',
        type: type || 'استشارة',
      },
    });

    return NextResponse.json(
      { success: true, message: 'تم الحجز بنجاح', data: updatedAppointment }, 
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: 'فشل في حجز الموعد' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}