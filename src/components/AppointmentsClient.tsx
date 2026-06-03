'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, User, Plus, X, Calendar as CalendarIcon, Trash2, Filter, UserPlus, Phone, FileText, CalendarDays } from 'lucide-react';
import { createCustomAppointment, bookAppointment, cancelAppointment, deleteAppointment, convertGuestToPatient } from '@/app/actions/actions';

interface Patient {
  id: string;
  fullName: string;
}

interface Appointment {
  id: string;
  appointmentDatetime: Date;
  status: string;
  type?: string | null;
  patientId?: string | null;
  patient?: Patient | null;
  patientName?: string | null;
  patientPhone?: string | null;
  notes?: string | null;
}

export default function AppointmentsClient({ 
  appointments, 
  patients 
}: { 
  appointments: Appointment[], 
  patients: Patient[] 
}) {
  // حالة التاريخ المختار للفلترة (يبدأ بتاريخ اليوم، وإذا كان فارغاً "" يعرض الكل)
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // نافذة إضافة موعد جديد
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inputDate, setInputDate] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [inputPatientId, setInputPatientId] = useState("");
  const [inputType, setInputType] = useState("استشارة");

  // نافذة حجز موعد متاح
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [bookPatientId, setBookPatientId] = useState("");
  const [bookType, setBookType] = useState("استشارة");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // دالة إنشاء موعد مخصص
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDate || !inputTime) return;

    setIsSubmitting(true);
    try {
      const combinedDateTime = new Date(`${inputDate}T${inputTime}`);
      await createCustomAppointment(combinedDateTime, inputPatientId || undefined, inputType);
      setIsAddModalOpen(false);
      setInputDate("");
      setInputTime("");
      setInputPatientId("");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إضافة الموعد");
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة حجز وقت متاح لمريض
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !bookPatientId) return;

    setIsSubmitting(true);
    try {
      await bookAppointment(selectedAppId, bookPatientId, bookType);
      setIsBookModalOpen(false);
      setSelectedAppId(null);
      setBookPatientId("");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحجز");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm("هل أنت متأكد من إلغاء هذا الموعد وإعادته كـ متاح؟")) {
      await cancelAppointment(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الموعد نهائياً من الجدول؟")) {
      const result = await deleteAppointment(id);
      if (result && !result.success) {
        alert(result.message);
      }
    }
  };

  // دالة تحويل الزائر إلى مريض رسمي
  const handleConvertToPatient = async (appId: string, name: string, phone: string) => {
    if (confirm(`هل تريد فتح ملف جديد للمريض (${name}) وحفظ بياناته في النظام؟`)) {
      setIsSubmitting(true);
      const result = await convertGuestToPatient(appId, name, phone);
      setIsSubmitting(false);
      
      if (result && result.success) {
        alert("تم إنشاء ملف المريض وربط الموعد بنجاح!");
      } else {
        alert(result?.message || "حدث خطأ أثناء التحويل");
      }
    }
  };

  // 🔴 تصفية المواعيد الذكية: إذا كان filterDate فارغاً يعرض كل شيء
  const filteredAppointments = appointments.filter((app) => {
    if (!filterDate) return true; // عرض الكل بدون فلترة تاريخ
    const appDateStr = new Date(app.appointmentDatetime).toISOString().split('T')[0];
    return appDateStr === filterDate;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* الترويسة العلوية مع زر الإضافة والفلتر */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="text-blue-500" /> إدارة وجدولة المواعيد
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {filterDate ? `عرض مواعيد يوم: ${filterDate}` : "عرض جميع المواعيد في النظام"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {/* قسم الفلترة المطور */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
            <Filter className="w-4 h-4 text-blue-500" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer [color-scheme:dark]"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-amber-400 border border-amber-500/10 transition-all"
                title="إلغاء الفلترة وعرض كافة المواعيد"
              >
                عرض الكل
              </button>
            )}
          </div>

          {/* زر سريع للعودة لليوم الحالي إذا كان يعرض الكل */}
          {!filterDate && (
            <button
              onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium transition-all flex items-center gap-1"
            >
              <CalendarDays className="w-4 h-4" /> مواعيد اليوم
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 text-sm"
          >
            <Plus className="w-4 h-4" /> إضافة موعد
          </button>
        </div>
      </div>

      {/* قائمة المواعيد المفلترة */}
      <div className="grid gap-3">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const dateObj = new Date(app.appointmentDatetime);
            const dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
            const dateStr = dateObj.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

            // تمييز ما إذا كان الحجز خارجي من الويب ولم يربط بملف مريض بعد
            const isExternalGuest = !app.patient && app.patientName;

            return (
              <div
                key={app.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  app.status === 'متاح'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : isExternalGuest
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-[#0f172a] border-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl hidden sm:block ${
                    app.status === 'متاح' ? 'bg-emerald-500/10 text-emerald-400' 
                    : isExternalGuest ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{timeStr}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{dayName} - {dateStr}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">الحالة: <span className={
                      app.status === 'متاح' ? 'text-emerald-400' : isExternalGuest ? 'text-amber-400' : 'text-blue-400'
                    }>{app.status}</span> {app.type && `(${app.type})`}</p>
                    
                    {app.notes && <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{app.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 flex-wrap">
                  {app.status === 'متاح' ? (
                    <>
                      <span className="text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded-lg">يظهر في صفحة الحجز</span>
                      <button
                        onClick={() => { setSelectedAppId(app.id); setIsBookModalOpen(true); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" /> تسكين مريض
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 text-rose-500 hover:text-rose-400 bg-rose-500/10 rounded-xl transition-all"
                        title="حذف الموعد نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : isExternalGuest ? (
                    // --- حالة الحجز الخارجي القادم من الويب ---
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <div className="flex flex-col items-end sm:items-start gap-1 mr-2">
                        <span className="text-sm text-amber-400 font-bold flex items-center gap-1.5">
                          <User className="w-4 h-4" /> {app.patientName} <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">حجز ويب</span>
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {app.patientPhone}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleConvertToPatient(app.id, app.patientName!, app.patientPhone!)}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-sm flex items-center gap-1.5 transition-all"
                      >
                        <UserPlus className="w-4 h-4" /> فتح ملف مريض
                      </button>

                      <button onClick={() => handleCancel(app.id)} className="p-2 text-orange-400 hover:text-orange-300 bg-orange-400/10 rounded-xl transition-all" title="إلغاء الحجز">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // --- حالة المريض المسجل رسميًا (الانتقال لملف المريض في الـ app) ---
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/patients/${app.patient?.id || app.patientId}`}
                        className="text-sm text-blue-400 flex items-center gap-1.5 bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/10 transition-all group"
                        title="اضغط للانتقال الفوري إلى ملف المريض"
                      >
                        <FileText className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" /> 
                        <span className="font-medium">{app.patient?.fullName}</span>
                      </Link>

                      <button
                        onClick={() => handleCancel(app.id)}
                        className="p-2 text-orange-400 hover:text-orange-300 bg-orange-400/10 rounded-xl transition-all"
                        title="إلغاء الحجز وإعادته كمتاح"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 text-rose-500 hover:text-rose-400 bg-rose-500/10 rounded-xl transition-all"
                        title="حذف الموعد نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
            {filterDate ? "لا توجد مواعيد مضافة في هذا اليوم المحدد." : "جدول المواعيد فارغ تماماً في قاعدة البيانات."}
          </div>
        )}
      </div>

      {/* --- نافذة إضافة وقت أو موعد جديد --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">إضافة موعد أو وقت متاح</h2>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">التاريخ</label>
                  <input required type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">الوقت</label>
                  <input required type="time" value={inputTime} onChange={(e) => setInputTime(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">تعيين مريض مباشرة (اختياري)</label>
                <select value={inputPatientId} onChange={(e) => setInputPatientId(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm">
                  <option value="">-- اتركه فارغاً ليكون متاحاً للحجز لاحقاً --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">نوع الجلسة</label>
                <select value={inputType} onChange={(e) => setInputType(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm">
                  <option value="استشارة">استشارة</option>
                  <option value="علاج">علاج</option>
                  <option value="مراجعة">مراجعة</option>
                  <option value="تقويم">تقويم</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all text-sm disabled:opacity-50">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإضافة'}
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-all border border-white/10 text-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- نافذة تسكين مريض في وقت متاح حالي --- */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">تسكين مريض في الموعد</h2>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">اختر المريض</label>
                <select required value={bookPatientId} onChange={(e) => setBookPatientId(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm">
                  <option value="" disabled>-- اختر المريض --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">نوع الجلسة</label>
                <select value={bookType} onChange={(e) => setBookType(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm">
                  <option value="استشارة">استشارة</option>
                  <option value="علاج">علاج</option>
                  <option value="مراجعة">مراجعة</option>
                  <option value="تقويم">تقويم</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-all text-sm disabled:opacity-50">
                  {isSubmitting ? 'جاري الحفظ...' : 'تأكيد الحجز للمريض'}
                </button>
                <button type="button" onClick={() => { setIsBookModalOpen(false); setSelectedAppId(null); }} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-all border border-white/10 text-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}