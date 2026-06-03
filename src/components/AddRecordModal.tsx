'use client';

import { useState } from 'react';
import { FileImage, X, Loader2, UploadCloud } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { addDentalRecordAction } from '@/app/actions/record';

// تهيئة عميل Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AddRecordModal({ caseId, patientId }: { caseId: string, patientId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('يرجى اختيار صورة أولاً');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const fileType = formData.get('fileType') as string;
    const phase = formData.get('phase') as string;

    try {
      // 1. رفع الصورة إلى Supabase Storage (Bucket: dental-records)
    const fileExt = file.name.split('.').pop();
      // تأكد أن الاسم لا يحتوي على مسارات فرعية إذا لم تكن موجودة
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('dental-records')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error("Supabase Error:", uploadError); // راقب هذا الخطأ في الـ Console
        throw new Error(`خطأ في الرفع: ${uploadError.message}`);
      }
      // 2. الحصول على الرابط العام للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('dental-records')
        .getPublicUrl(fileName);

      // 3. حفظ الرابط والبيانات في قاعدة بيانات Prisma عبر السيرفر أكشن
      const dbResult = await addDentalRecordAction(caseId, patientId, publicUrl, fileType, phase);

      if (dbResult.success) {
        setIsOpen(false);
        setFile(null);
      } else {
        throw new Error(dbResult.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('حدث خطأ غير متوقع');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all font-medium border border-blue-500/30 shadow-lg"
      >
        <FileImage className="w-4 h-4" /> رفع صورة
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-transparent">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-400" />
                إضافة سجل طبي أو صورة
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* منطقة اختيار الملف */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">الملف / الصورة</label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <p className="text-blue-400 font-medium text-sm truncate">{file.name}</p>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <UploadCloud className="w-8 h-8" />
                      <span className="text-sm">اضغط لاختيار صورة أو اسحبها هنا</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">نوع الصورة</label>
                  <select name="fileType" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]">
                    <option value="بانوراما (Panorama)">بانوراما (Panorama)</option>
                    <option value="صورة وجه (Extraoral)">صورة وجه (Extraoral)</option>
                    <option value="داخل الفم (Intraoral)">داخل الفم (Intraoral)</option>
                    <option value="سيفالومترك (Ceph)">سيفالومترك (Ceph)</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">مرحلة العلاج</label>
                  <select name="phase" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]">
                    <option value="قبل العلاج">قبل العلاج (Pre-treatment)</option>
                    <option value="أثناء العلاج">أثناء العلاج (Progress)</option>
                    <option value="بعد العلاج">بعد العلاج (Post-treatment)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-all font-medium">
                  إلغاء
                </button>
                <button type="submit" disabled={isUploading || !file} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'رفع وحفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}