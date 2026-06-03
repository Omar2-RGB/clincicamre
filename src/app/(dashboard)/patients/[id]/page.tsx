import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { 
  ArrowRight, Phone, Calendar, ClipboardList, Banknote, ImageIcon, Activity, Stethoscope, FilePlus2
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import PatientQRCode from '@/components/PatientQRCode';
import EditCaseModal from '@/components/EditCaseModal';
import AddVisitModal from '@/components/AddVisitModal';
import AddRecordModal from '@/components/AddRecordModal';

// السيرفر أكشن لفتح حالة جديدة مباشرة داخل الملف
async function createNewCase(formData: FormData) {
  'use server';
  const patientId = formData.get('patientId') as string;
  if (!patientId) throw new Error('معرف المريض مفقود');

  try {
    await prisma.case.create({
      data: {
        patientId: patientId,
        status: 'جاري',
        totalCost: 0,
      },
    });
    revalidatePath(`/patients/${patientId}`);
  } catch (error) {
    console.error('Error creating new case:', error);
    throw new Error('حدث خطأ أثناء إنشاء الحالة الجديدة');
  }
}

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. جلب المريض مع أحدث حالة علاجية، وجلب إعدادات العيادة للعملة
  const [patient, clinicProfile] = await Promise.all([
    prisma.patient.findUnique({
      where: { id },
      include: {
        cases: {
          orderBy: { createdAt: 'desc' },
          take: 1, 
          include: {
            payments: { orderBy: { createdAt: 'desc' } },
            dentalRecords: { orderBy: { createdAt: 'desc' } },
            visits: { orderBy: { visitDate: 'desc' } } 
          }
        }
      }
    }),
    prisma.clinicProfile.findFirst()
  ]);

  if (!patient) notFound();

  // تحديد العملة والرمز
  const currency = clinicProfile?.currency || 'SYP';
  const symbol = currency === 'USD' ? '$' : 'ل.س';

  // 2. استخراج الحالة النشطة
  const activeCase = patient.cases[0];
  
  // 3. الحسابات المالية
  const totalCost = activeCase?.totalCost || 0;
  const totalPaid = activeCase?.payments.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const remaining = totalCost - totalPaid;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-10">
      
      {/* ----------------- الترويسة ----------------- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] border border-white/10 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <Link href="/patients" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-900 border-2 border-white/20 flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-2xl">{patient.fullName.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{patient.fullName}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${patient.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {patient.status === 'ACTIVE' ? 'نشط' : 'مؤرشف'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-400">
                <p className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-400" /> <span dir="ltr">{patient.phone}</span></p>
                <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400" /> {patient.age ? `${patient.age} سنة` : 'العمر غير مسجل'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <PatientQRCode patientId={patient.id} patientName={patient.fullName} patientPhone={patient.phone} />
          <Link href={`/patients/${patient.id}/edit`} className="px-5 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium hover:bg-blue-600/30 transition-all">
            تعديل الملف
          </Link>
        </div>
      </header>

      {!activeCase ? (
        <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed flex flex-col items-center justify-center gap-4">
          <Activity className="w-12 h-12 text-gray-500" />
          <div>
            <h2 className="text-xl font-bold text-white">لا توجد حالة علاجية نشطة</h2>
            <p className="text-gray-400 text-sm mt-1">هذا المريض جديد وليس لديه خطة علاج أو ملف مالي بعد.</p>
          </div>
          <form action={createNewCase}>
            <input type="hidden" name="patientId" value={patient.id} />
            <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all mt-2">
              <FilePlus2 className="w-5 h-5" /> فتح حالة جديدة
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-white/10 shadow-lg relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-1 h-full ${activeCase.status === 'جاري' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-400" /> خطة العلاج
                </h2>
                <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300 border border-white/10">{activeCase.status}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                {activeCase.treatmentPlan || 'لم يتم كتابة تفاصيل خطة العلاج.'}
              </p>
              <EditCaseModal 
                caseId={activeCase.id} 
                patientId={patient.id} 
                currentPlan={activeCase.treatmentPlan} 
                currentCost={activeCase.totalCost} 
              />
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a] border border-white/10 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-rose-400" /> الجلسات السابقة
                </h2>
                <AddVisitModal caseId={activeCase.id} patientId={patient.id} />
              </div>
              <div className="space-y-4">
                {activeCase.visits.length > 0 ? activeCase.visits.map((visit) => (
                  <div key={visit.id} className="p-3 bg-black/40 rounded-xl border border-white/5 border-r-2 border-r-rose-500/50">
                    <span className="text-sm font-medium text-white">{new Date(visit.visitDate).toLocaleDateString('ar-EG')}</span>
                    <p className="text-xs text-gray-400">{visit.proceduresDone}</p>
                  </div>
                )) : <p className="text-sm text-gray-500 text-center py-4">لا يوجد جلسات مسجلة.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-white/10 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Banknote className="w-6 h-6 text-emerald-400" /> المالية ({symbol})
                </h2>
                <PaymentModal caseId={activeCase.id} patientId={patient.id} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                  <p className="text-sm text-gray-500">التكلفة الكلية</p>
                  <p className="text-2xl font-bold text-white">{totalCost.toLocaleString()} {symbol}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                  <p className="text-sm text-emerald-400/70">المدفوع</p>
                  <p className="text-2xl font-bold text-emerald-400">{totalPaid.toLocaleString()} {symbol}</p>
                </div>
                <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-center">
                  <p className="text-sm text-rose-400/70">المتبقي</p>
                  <p className="text-2xl font-bold text-rose-400">{remaining.toLocaleString()} {symbol}</p>
                </div>
              </div>

              {activeCase.payments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">سجل الدفعات</h3>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeCase.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-sm">
                        <span className="text-white font-medium">{payment.amount.toLocaleString()} {symbol}</span>
                        <span className="text-gray-500 text-xs">{new Date(payment.paymentDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a] border border-white/10 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-blue-400" /> الصور والأشعة
                </h2>
                <AddRecordModal caseId={activeCase.id} patientId={patient.id} />
              </div>

              {activeCase.dentalRecords.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeCase.dentalRecords.map((record) => (
                    <Link key={record.id} href={record.imageUrl} target="_blank" className="group relative aspect-square rounded-xl bg-black/40 border border-white/5 overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                      <div className="flex-1 bg-gray-800 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${record.imageUrl})` }}></div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-black/20 rounded-xl border border-white/5 border-dashed">
                  <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">لا يوجد صور أو أشعة مرفوعة.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}