'use client';

import { useState, useTransition } from 'react';
import { Stethoscope, X, Loader2, Calendar } from 'lucide-react';
import { addVisitAction } from '@/app/actions/visit';

export default function AddVisitModal({ caseId, patientId }: { caseId: string, patientId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // الحصول على تاريخ اليوم كقيمة افتراضية بصيغة YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await addVisitAction(null, formData);
      if (result?.success) {
        setIsOpen(false);
      } else if (result?.message) {
        setErrorMsg(result.message);
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all font-medium border border-rose-500/20"
      >
        + جلسة جديدة
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-rose-900/20 to-transparent">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-400" />
                تسجيل جلسة جديدة
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4">
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="patientId" value={patientId} />

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-400" /> تاريخ الجلسة
                </label>
                <input 
                  type="date" 
                  name="visitDate" 
                  required
                  defaultValue={today}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-rose-400" /> الإجراءات التي تمت
                </label>
                <textarea 
                  name="proceduresDone" 
                  rows={3}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 resize-none transition-all"
                  placeholder="مثال: تركيب حاصرات، شد سلك، أخذ طبعات..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ الجلسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}