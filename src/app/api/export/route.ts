import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// دالة مساعدة لتغليف النصوص وحمايتها من تخريب الأعمدة في الإكسيل
// أضفنا أنواع البيانات بدلاً من any
const escapeCsv = (text: string | number | null | undefined) => {
  if (text === null || text === undefined) return '""';
  const str = String(text).replace(/"/g, '""');
  return `"${str}"`;
};
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        cases: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { payments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // \uFEFF هو الـ BOM لتعريف الإكسيل أن الملف يدعم اللغة العربية (UTF-8)
    let csvContent = '\uFEFF'; 
    
    // أسماء الأعمدة (مغلفة بعلامات تنصيص)
    csvContent += `${escapeCsv("اسم المريض")},${escapeCsv("رقم الهاتف")},${escapeCsv("العمر")},${escapeCsv("حالة المريض")},${escapeCsv("إجمالي الخطة")},${escapeCsv("المبلغ المدفوع")},${escapeCsv("المتبقي (الديون)")}\n`;

    // تعبئة البيانات
    patients.forEach((patient) => {
      const activeCase = patient.cases[0];
      const totalCost = activeCase?.totalCost || 0;
      const paid = activeCase?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = totalCost - paid;

      const cleanName = patient.fullName || 'بدون اسم';
      const cleanPhone = patient.phone || 'غير محدد';
      const age = patient.age || 'غير محدد';
      const status = patient.status === 'ACTIVE' ? 'نشط' : 'مؤرشف';

      csvContent += `${escapeCsv(cleanName)},${escapeCsv(cleanPhone)},${escapeCsv(age)},${escapeCsv(status)},${escapeCsv(totalCost)},${escapeCsv(paid)},${escapeCsv(remaining)}\n`;
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="clinic_patients_financials.csv"',
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("حدث خطأ أثناء تصدير البيانات", { status: 500 });
  }
}