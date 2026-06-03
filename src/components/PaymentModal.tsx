'use client';

import { useState, useActionState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { addPaymentAction } from '@/app/actions/payment';

export default function PaymentModal({ caseId, patientId }: { caseId: string, patientId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // ربط الأكشن مع الواجهة
  const [state, action, isPending] = useActionState(addPaymentAction, null);

  // إغلاق النافذة عند النجاح
  if (state?.success && isOpen) {
    setIsOpen(false);
  }

  return (
    <>
      {/* زر فتح النافذة */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all"
      >
        <Plus className="w-4 h-4" /> إضافة دفعة
      </button>

      {/* النافذة المنبثقة */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">إضافة دفعة مالية جديدة</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={action} className="p-6 space-y-4">
              {/* حقول مخفية لإرسال المعرفات للسيرفر */}
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="patientId" value={patientId} />

              {/* رسالة الخطأ إن وجدت */}
              {state?.success === false && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {state.message}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">المبلغ ($) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  required
                  step="0.01"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="مثال: 150"
                />
                {state?.errors?.amount && <p className="text-rose-400 text-xs">{state.errors.amount[0]}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">ملاحظات (اختياري)</label>
                <textarea 
                  name="notes" 
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none"
                  placeholder="أي ملاحظات حول الدفعة..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ الدفعة'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}