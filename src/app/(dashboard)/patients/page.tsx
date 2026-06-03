import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Search, Plus, ArrowUpLeft, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page } = await searchParams;
  const currentPage = parseInt(page || '1');
  const pageSize = 10;

  // إعداد استعلام البحث
  const where = search ? {
    fullName: { contains: search, mode: 'insensitive' as const }
  } : {};

  // جلب البيانات مع الترقيم والبحث، بالإضافة إلى جلب آخر حالة علاجية لكل مريض!
  const [patients, totalPatients] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      // ✨ التعديل هنا: جلب الحالات العلاجية لمعرفة وضعیت المريض
      include: {
        cases: {
          orderBy: { createdAt: 'desc' },
          take: 1, // جلب أحدث حالة فقط
        }
      }
    }),
    prisma.patient.count({ where })
  ]);

  const totalPages = Math.ceil(totalPatients / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">المرضى</h1>
          <p className="text-sm text-gray-400 mt-1">إدارة ملفات {totalPatients} مريضاً.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* شريط البحث */}
          <form action="/patients" method="GET" className="relative flex-1 md:w-64 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              <input 
                name="search"
                defaultValue={search}
                type="text" 
                placeholder="ابحث عن مريض..." 
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 backdrop-blur-md transition-all"
              />
            </div>
          </form>
          
          <Link href="/patients/new" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
            <Plus className="w-5 h-5" /> مريض جديد
          </Link>
        </div>
      </header>

      {/* الجدول */}
      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-right whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="py-4 px-6 text-sm font-medium text-gray-400">المريض</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">رقم الهاتف</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">الحالة العلاجية</th>
                <th className="py-4 px-6 text-sm font-medium text-gray-400">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {patients.map((patient) => {
                // استخراج حالة المريض الحالية (إن وجدت)
                const activeCase = patient.cases[0];

                return (
                  <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <Link href={`/patients/${patient.id}`} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center font-bold text-blue-400">
                          {patient.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{patient.fullName}</p>
                          <p className="text-xs text-gray-500">{patient.address || 'بدون عنوان'}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{patient.phone}</td>
                    
                    {/* ✨ التعديل هنا: عرض حالة المريض بناءً على جدول Cases */}
                    <td className="py-4 px-6">
                      {activeCase ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          activeCase.status === 'جاري' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          activeCase.status === 'مكتمل' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          <Activity className="w-3.5 h-3.5" />
                          {activeCase.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">لا توجد حالة</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <Link href={`/patients/${patient.id}`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium">
                        عرض الملف <ArrowUpLeft className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* الترقيم */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-white/5">
            <Link href={`?page=${currentPage - 1}${search ? `&search=${search}` : ''}`} className={`p-2 rounded-lg ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'bg-white/5 hover:bg-white/10 transition-colors'}`}>
              <ChevronRight className="w-5 h-5 text-white" />
            </Link>
            <span className="text-sm text-gray-400">صفحة {currentPage} من {totalPages}</span>
            <Link href={`?page=${currentPage + 1}${search ? `&search=${search}` : ''}`} className={`p-2 rounded-lg ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'bg-white/5 hover:bg-white/10 transition-colors'}`}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}