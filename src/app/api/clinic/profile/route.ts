import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// إعدادات الـ CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  try {
    let profile = await prisma.clinicProfile.findFirst();

    if (!profile) {
      profile = await prisma.clinicProfile.create({
        data: {
          doctorName: "د. عمر عبد العزيز",
          specialty: "أخصائي طب وتجميل الأسنان",
          bio: "نقدم رعاية طبية بأحدث التقنيات.",
          mapLink: "https://maps.google.com",
          workingHours: "[]",
          gallery: ""
        }
      });
    }

    return NextResponse.json({ success: true, data: profile }, { headers: corsHeaders });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في جلب البيانات' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doctorName, specialty, bio, avatarUrl, mapLink, workingHours, gallery } = body;

    const existingProfile = await prisma.clinicProfile.findFirst();

    let updatedProfile;
    if (existingProfile) {
      updatedProfile = await prisma.clinicProfile.update({
        where: { id: existingProfile.id },
        data: { doctorName, specialty, bio, avatarUrl, mapLink, workingHours, gallery }
      });
    } else {
      updatedProfile = await prisma.clinicProfile.create({
        data: { doctorName, specialty, bio, avatarUrl, mapLink, workingHours, gallery }
      });
    }

    return NextResponse.json({ success: true, data: updatedProfile }, { headers: corsHeaders });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'خطأ في تحديث البيانات' }, { status: 500, headers: corsHeaders });
  }
}