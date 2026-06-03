"use client";

import { useState, useEffect } from "react";

export default function ClinicSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    doctorName: "",
    specialty: "",
    bio: "",
    avatarUrl: "",
    mapLink: "",
    gallery: "",
    workingHours: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/clinic/profile");
        const data = await res.json();
        if (data.success && data.data) {
          setFormData({
            doctorName: data.data.doctorName || "",
            specialty: data.data.specialty || "",
            bio: data.data.bio || "",
            avatarUrl: data.data.avatarUrl || "",
            mapLink: data.data.mapLink || "",
            gallery: data.data.gallery || "",
            workingHours: data.data.workingHours || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // دالة رفع الصور داخلياً
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (result.success) {
        const newGallery = formData.gallery ? `${formData.gallery},${result.url}` : result.url;
        setFormData({ ...formData, gallery: newGallery });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/clinic/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setMessage(data.success ? { type: "success", text: "تم الحفظ بنجاح!" } : { type: "error", text: data.message });
    } catch {
      setMessage({ type: "error", text: "خطأ في الاتصال" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-white">جاري التحميل...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">إعدادات العيادة</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="doctorName" value={formData.doctorName} onChange={handleChange} className="w-full bg-slate-800 p-3 text-white rounded-lg" placeholder="اسم الطبيب" />
          <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="w-full bg-slate-800 p-3 text-white rounded-lg" placeholder="التخصص" />
        </div>

        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full bg-slate-800 p-3 text-white rounded-lg" placeholder="نبذة عن الطبيب"></textarea>

        <div>
          <label className="block text-sm text-gray-300 mb-2">معرض صور الأعمال (يمكنك الرفع مباشرة)</label>
          <input type="file" onChange={handleFileUpload} className="mb-4 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:bg-blue-600 file:text-white file:rounded-full file:border-0" />
          {isUploading && <p className="text-blue-400 text-sm">جاري رفع الصورة...</p>}
          <textarea name="gallery" value={formData.gallery} onChange={handleChange} rows={2} className="w-full bg-slate-800 p-3 text-white rounded-lg" placeholder="روابط الصور..."></textarea>
        </div>

        <textarea name="workingHours" value={formData.workingHours} onChange={handleChange} rows={4} className="w-full bg-slate-800 p-3 text-white rounded-lg font-mono" placeholder="أوقات الدوام (JSON)"></textarea>

        <button type="submit" disabled={isSaving} className="w-full bg-blue-600 p-3 text-white rounded-lg hover:bg-blue-700">
          {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}