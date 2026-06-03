import { prisma } from '@/lib/prisma';
import AppointmentsClient from '@/components/AppointmentsClient';
import Link from 'next/link';
import { FileText } from 'lucide-react'; // تأكد من إضافة FileText إلى قائمة أيقونات lucide
export default async function AppointmentsPage() {
  // جلب المواعيد بترتيب تصاعدي حسب التاريخ والوقت
  const appointments = await prisma.appointment.findMany({
    include: { patient: true },
    orderBy: { appointmentDatetime: 'asc' },
  });

  // جلب قائمة المرضى للاختيار منهم
  const patients = await prisma.patient.findMany({
    orderBy: { fullName: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8">
      <AppointmentsClient appointments={appointments} patients={patients} />
    </div>
  );
}