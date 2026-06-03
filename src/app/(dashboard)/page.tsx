import { prisma } from '@/lib/prisma';
import { Users, Calendar, Banknote, Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  // 1. جلب العملة المختارة من الإعدادات
  const clinicProfile = await prisma.clinicProfile.findFirst();
  const currency = clinicProfile?.currency || 'SYP';
  const symbol = currency === 'USD' ? '$' : 'ل.س';

  // 2. تجهيز تواريخ اليوم والشهر للفلترة
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 3. جلب الإحصائيات الحقيقية
  const totalPatients = await prisma.patient.count({
    where: { status: 'ACTIVE' }
  });

  const todayAppointmentsCount = await prisma.appointment.count({
    where: {
      appointmentDatetime: { gte: startOfDay, lt: endOfDay },
      status: { not: 'متاح' }
    }
  });

  const monthlyIncomeResult = await prisma.payment.aggregate({
    where: { paymentDate: { gte: startOfMonth } },
    _sum: { amount: true }
  });
  const monthlyIncome = monthlyIncomeResult._sum.amount || 0;

  const activeCasesCount = await prisma.case.count({
    where: { status: 'جاري' }
  });

  // 4. جلب المواعيد
  const todaysAppointments = await prisma.appointment.findMany({
    where: {
      appointmentDatetime: { gte: startOfDay, lt: endOfDay },
      status: { not: 'متاح' }
    },
    include: { patient: true },
    orderBy: { appointmentDatetime: 'asc' }
  });

  // 5. تجهيز المصفوفة (استخدمنا المتغير symbol هنا)
  const stats = [
    { title: 'إجمالي المرضى', value: totalPatients.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', blur: 'bg-blue-500' },
    { title: 'مواعيد اليوم', value: todayAppointmentsCount.toString(), icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10', blur: 'bg-purple-500' },
    { title: 'إيرادات الشهر', value: `${monthlyIncome.toLocaleString()} ${symbol}`, icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10', blur: 'bg-emerald-500' },
    { title: 'الحالات النشطة', value: activeCasesCount.toString(), icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10', blur: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-l from-white to-gray-400 bg-clip-text text-transparent">
            مرحباً دكتور،
          </h1>
          <p className="text-gray-400 mt-2">نظرة عامة على نشاط العيادة اليوم.</p>
        </div>
        <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 backdrop-blur-md">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="relative overflow-hidden p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 group shadow-lg">
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[50px] opacity-10 ${stat.blur}`}></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white tracking-wider">{stat.value}</h3>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} border border-white/5 shadow-inner`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* باقي الأقسام كما هي في كودك الأصلي */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* قسم المواعيد - (نفس كودك) */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:border-white/20 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">مواعيد اليوم</h2>
            <Link href="/appointments" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">إدارة المواعيد</Link>
          </div>
          
          {todaysAppointments.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
              {todaysAppointments.map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {app.patientName || app.patient?.fullName || 'مريض غير مسجل'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{app.type || 'استشارة'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-gray-300">
                      {new Date(app.appointmentDatetime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-white/10 rounded-xl bg-black/20 p-6 text-center">
              <Calendar className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-500">لا توجد مواعيد محجوزة لهذا اليوم</p>
            </div>
          )}
        </div>

        {/* قسم طلبات المخبر - (نفس كودك) */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:border-white/20 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">طلبات المخبر النشطة</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">إضافة طلب</button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-white/10 rounded-xl bg-black/20 p-6 text-center">
            <Activity className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-gray-500">جميع أجهزة التقويم جاهزة وتم استلامها</p>
          </div>
        </div>
      </div>
    </div>
  );
}