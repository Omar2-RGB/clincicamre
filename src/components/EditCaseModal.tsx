'use client';

import { useState, useTransition } from 'react';
import { Edit, X, Loader2, DollarSign, ClipboardList } from 'lucide-react';
import { updateCaseDetailsAction } from '@/app/actions/case';

export default function EditCaseModal({ 
  caseId, 
  patientId, 
  currentPlan, 
  currentCost 
}: { 
  caseId: string; 
  patientId: string;
  currentPlan: string | null;
  currentCost: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // استخدام useTransition بدلاً من useActionState للتحكم الدقيق
  const [isPending, startTransition] = useTransition();

  // دالة مخصصة لمعالجة الإرسال
  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null); // تصفير الأخطاء السابقة
    
    startTransition(async () => {
      // استدعاء السيرفر أكشن يدوياً
      const result = await updateCaseDetailsAction(null, formData);
      
      if (result?.success) {
        setIsOpen(false); // إغلاق النافذة فوراً عند النجاح (تخلصنا من useEffect!)
      } else if (result?.message) {
        setErrorMsg(result.message); // عرض رسالة الخطأ
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 text-sm font-medium transition-all border border-white/5"
      >
        <Edit className="w-4 h-4" /> تعديل الخطة والتكلفة
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-transparent">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-400" />
                تحديث تفاصيل الحالة
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* تم ربط النموذج بالدالة الجديدة handleSubmit */}
            <form action={handleSubmit} className="p-6 space-y-5">
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="patientId" value={patientId} />

              {/* عرض رسالة الخطأ إن وجدت */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> التكلفة الإجمالية للعلاج ($)
                </label>
                <input 
                  type="number" 
                  name="totalCost" 
                  required
                  step="1"
                  defaultValue={currentCost}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-lg"
                  placeholder="مثال: 1500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-400" /> تفاصيل خطة العلاج
                </label>
                <textarea 
                  name="treatmentPlan" 
                  rows={4}
                  defaultValue={currentPlan || ''}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none transition-all"
                  placeholder="اكتب الأجهزة المستخدمة، الأسنان المقلوعة، والمدة المتوقعة..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 transition-all font-medium border border-transparent"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}