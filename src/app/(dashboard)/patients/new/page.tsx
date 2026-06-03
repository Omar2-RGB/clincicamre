'use client';

import { useActionState } from 'react'; 
import { User, Phone, MapPin, Activity, Pill, AlertTriangle, FileText, ArrowRight, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { createPatientAction } from '@/app/actions/patient';

export default function NewPatientPage() {
  const [state, action, isPending] = useActionState(createPatientAction, null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      
      <header className="flex items-center gap-4">
        <Link href="/patients" className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">إضافة مريض جديد</h1>
          <p className="text-sm text-gray-400 mt-1">إدخال البيانات الشخصية والسجل الطبي للمريض.</p>
        </div>
      </header>

      {/* عرض رسالة الخطأ العامة إن وجدت */}
      {state?.success === false && state.message && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-8">
        
        {/* قسم المعلومات الشخصية */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500/50"></div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            المعلومات الشخصية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">الاسم الكامل *</label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
                <input name="fullName" type="text" placeholder="مثال: أحمد محمد" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
              </div>
              {state?.errors?.fullName && <p className="text-rose-500 text-xs">{state.errors.fullName[0]}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">رقم الهاتف *</label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
                <input name="phone" type="tel" placeholder="09xxxxxx" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-left" dir="ltr" />
              </div>
              {state?.errors?.phone && <p className="text-rose-500 text-xs">{state.errors.phone[0]}</p>}
            </div>

            {/* حقل البريد الإلكتروني المضاف */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
                <input name="email" type="email" placeholder="example@email.com" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-left" dir="ltr" />
              </div>
              {state?.errors?.email && <p className="text-rose-500 text-xs">{state.errors.email[0]}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">العمر</label>
              <input name="age" type="number" placeholder="25" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-400 font-medium">العنوان</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
                <input name="address" type="text" placeholder="المدينة، المنطقة، الشارع" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* قسم التاريخ الطبي */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/50"></div>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            التاريخ الطبي
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> الأمراض المزمنة
              </label>
              <textarea name="medicalHistory" rows={3} placeholder="مثال: سكري، ضغط، ربو..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <Pill className="w-4 h-4" /> الأدوية الحالية
              </label>
              <textarea name="medications" rows={3} placeholder="الأدوية التي يتناولها المريض بانتظام..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> الحساسية (Allergies)
              </label>
              <textarea name="allergies" rows={2} placeholder="حساسية من أدوية معينة مثل البنسلين..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">ملاحظات إضافية</label>
              <textarea name="notes" rows={2} placeholder="أي ملاحظات عامة..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div className="flex justify-end gap-4 pt-4">
          <Link href="/patients" className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all font-medium">
            إلغاء
          </Link>
          <button 
            type="submit" 
            disabled={isPending}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ المريض'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}