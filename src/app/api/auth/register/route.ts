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
    const { fullName, phone, email, password } = body;

    if (!fullName || !phone || !password) {
      return NextResponse.json({ success: false, message: 'البيانات الأساسية غير مكتملة' }, { status: 400, headers: corsHeaders });
    }

    // التأكد من عدم تكرار الحساب برقم الهاتف
    const existingPatient = await prisma.patient.findFirst({
      where: { phone: phone }
    });

    if (existingPatient) {
      return NextResponse.json({ success: false, message: 'رقم الهاتف هذا مسجل بالفعل' }, { status: 409, headers: corsHeaders });
    }

    // إنشاء سجل المريض الجديد في قاعدة البيانات
    // ملاحظة: في المشاريع الإنتاجية يفضل تشفير كلمة المرور باستخدام bcrypt
    const newPatient = await prisma.patient.create({
      data: {
        fullName: fullName,
        phone: phone,
        email: email || null,
        // إذا كان جدول المريض يحتوي على حقل لكلمة المرور أضفه هنا، وإلا يمكنك الاعتماد على رقم الهاتف كمعرف فريد
      },
    });

    return NextResponse.json({ success: true, message: 'تم إنشاء الحساب بنجاح', data: newPatient }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json({ success: false, message: 'فشل إنشاء الحساب' }, { status: 500, headers: corsHeaders });
  }
}