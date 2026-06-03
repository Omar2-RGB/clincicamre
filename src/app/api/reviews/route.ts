import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 1. جلب التقييمات لعرضها في صفحة المريض
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20 // جلب أحدث 20 تقييم
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    return NextResponse.json({ message: 'فشل في جلب التقييمات' }, { status: 500 });
  }
}

// 2. إضافة تقييم جديد من صفحة المريض
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rating, comment } = body;

    if (!name || !rating || !comment) {
      return NextResponse.json({ message: 'يرجى تعبئة جميع الحقول' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        name,
        rating: Number(rating),
        comment
      }
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error) {
    console.error('Add Review Error:', error);
    return NextResponse.json({ message: 'فشل في حفظ التقييم' }, { status: 500 });
  }
}