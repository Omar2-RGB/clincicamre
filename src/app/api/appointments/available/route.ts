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
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const whereClause: Prisma.AppointmentWhereInput = { status: 'متاح' };

    // إصلاح مشكلة التوقيت في البحث
    if (dateParam) {
      // إجبار السيرفر على البحث بناءً على بداية ونهاية اليوم بتوقيت العيادة المحلي (UTC+3)
      // بدلاً من توقيت غرينتش الذي يسبب ضياع المواعيد الصباحية
      const startOfDay = new Date(`${dateParam}T00:00:00.000+03:00`);
      const endOfDay = new Date(`${dateParam}T23:59:59.999+03:00`);

      whereClause.appointmentDatetime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

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

    // 🌟 الحل السحري: تجهيز الوقت كنص ثابت لا يتغير 🌟
    const formattedData = availableAppointments.map(app => {
      const dateObj = new Date(app.appointmentDatetime);
      
      return {
        id: app.id,
        // نُبقي التاريخ الأصلي في حال احتاجه الفلاتر
        appointmentDatetime: app.appointmentDatetime, 
        duration: app.duration,
        status: app.status,
        
        // المتغيرات الجديدة التي سيقرأها تطبيق المريض مباشرة
        formattedTime: dateObj.toLocaleTimeString('ar-SY', {
          timeZone: 'Asia/Damascus', // تثبيت التوقيت
          hour: '2-digit',
          minute: '2-digit',
          hour12: true // صيغة 12 ساعة (ص/م)
        }),
        formattedDate: dateObj.toLocaleDateString('en-CA', {
          timeZone: 'Asia/Damascus'
        })
      };
    });

    return NextResponse.json(
      { success: true, data: formattedData }, 
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