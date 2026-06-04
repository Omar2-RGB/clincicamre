import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. تعريف شكل البيانات (Type) لإرضاء TypeScript
interface AppointmentRecord {
  id: string;
  patientName?: string | null;
  patient?: { name: string | null } | null;
  date?: string | null;
  time?: string | null;
  createdAt: Date | string;
}

export async function GET() {
  try {
    const recentAppointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 2. استخدام النوع الذي عرفناه بدلاً من any
    const formattedData = recentAppointments.map((app: AppointmentRecord) => ({
      id: app.id,
      patientName: app.patientName || (app.patient && app.patient.name) || "مريض جديد",
      date: app.date || "غير محدد",
      time: app.time || "غير محدد",
      createdAt: app.createdAt
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedData 
    });
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}