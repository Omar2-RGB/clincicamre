import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body; // سنعتمد تسجيل الدخول السريع برقم الهاتف

    if (!phone) {
      return NextResponse.json({ success: false, message: 'الرجاء إدخال رقم الهاتف' }, { status: 400, headers: corsHeaders });
    }

    // البحث عن المريض في قاعدة البيانات
    const patient = await prisma.patient.findFirst({
      where: { phone: phone }
    });

    if (!patient) {
      return NextResponse.json({ success: false, message: 'الحساب غير موجود، يرجى إنشاء حساب أولاً' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: 'تم تسجيل الدخول بنجاح', data: patient }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500, headers: corsHeaders });
  }
}