"use client";

import { useState } from "react";
import { Shield, Bell, Database, Globe, Key, Download, HardDrive, UserPlus } from "lucide-react";
import { updateCurrencyPreference } from "@/app/actions/settings";
import { createUserAction } from "@/app/actions/auth"; // أضف هذا السطر
export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState("preferences");
  
  // States الخاصة بالتفضيلات
  const [currency, setCurrency] = useState("SYP");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States لإنشاء مستخدم جديد
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  // دالة حفظ العملة والتفضيلات
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // استدعاء السيرفر أكشن لحفظ العملة في قاعدة البيانات
    const result = await updateCurrencyPreference(currency);
    
    setIsSubmitting(false);
    if(result.success) {
      alert("تم حفظ التفضيلات وتحديث العملة بنجاح!");
    } else {
      alert("حدث خطأ أثناء الحفظ!");
    }
  };

 const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
      alert("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    
    setIsSubmitting(true);
    
    // تجهيز البيانات لإرسالها
    const formData = new FormData();
    formData.append('email', newUserEmail);
    formData.append('password', newUserPassword);

    try {
      // استدعاء الأكشن الحقيقي
      const result = await createUserAction(formData);
      
      setIsSubmitting(false);
      
      if (result.success) {
         alert("تم إنشاء المستخدم بنجاح! يمكنك الآن تسجيل الدخول.");
         setNewUserEmail("");
         setNewUserPassword("");
      } else {
         alert(result.message || "حدث خطأ أثناء الإنشاء");
      }

    } catch (error) {
      setIsSubmitting(false);
      alert("تعذر الاتصال بالخادم.");
    }
  };

  // دالة وهمية لباقي التبويبات
  const handleDummySave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("تم حفظ التعديلات بنجاح!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* الترويسة */}
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          إعدادات النظام
        </h1>
        <p className="text-sm text-gray-400 mt-1">تخصيص تفضيلات العيادة، الأمان، وإدارة النسخ الاحتياطي</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* القائمة الجانبية للتبويبات */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "preferences" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <Globe className="w-4 h-4" /> التفضيلات العامة
          </button>
          
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "security" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <Shield className="w-4 h-4" /> الأمان والحساب
          </button>

          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "notifications" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <Bell className="w-4 h-4" /> الإشعارات والتذكير
          </button>

          <button 
            onClick={() => setActiveTab("backup")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "backup" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <Database className="w-4 h-4" /> النسخ الاحتياطي
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="flex-1 bg-[#0f172a] border border-white/5 rounded-2xl shadow-lg p-6 min-h-[400px]">
          
          {/* تبويب التفضيلات */}
          {activeTab === "preferences" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">التفضيلات المحلية</h2>
              <form onSubmit={handleSavePreferences} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">العملة الافتراضية للنظام</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full max-w-md p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="SYP">ليرة سورية (ل.س)</option>
                    <option value="USD">دولار أمريكي ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">تنسيق التاريخ</label>
                  <select className="w-full max-w-md p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm">
                    <option value="DD/MM/YYYY">DD/MM/YYYY (25/06/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (06/25/2026)</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all">
                    {isSubmitting ? "جاري الحفظ..." : "حفظ التفضيلات"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* تبويب الأمان */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* قسم إضافة مستخدم جديد */}
              <div>
                <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3 mb-5">إضافة مستخدم جديد للنظام</h2>
                <form onSubmit={handleCreateUser} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">البريد الإلكتروني للمستخدم</label>
                      <input 
                        type="email" 
                        required 
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="admin@clinic.com"
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">كلمة المرور</label>
                      <input 
                        type="password" 
                        required 
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 text-sm" 
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                      <UserPlus className="w-4 h-4" /> إنشاء المستخدم
                    </button>
                  </div>
                </form>
              </div>

              {/* قسم تغيير كلمة المرور الحالية */}
              <div className="pt-6 border-t border-white/5">
                <h2 className="text-lg font-bold text-white mb-5">تغيير كلمة المرور الخاصة بك</h2>
                <form onSubmit={handleDummySave} className="space-y-5">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">كلمة المرور الحالية</label>
                    <input type="password" required className="w-full max-w-md p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">كلمة المرور الجديدة</label>
                    <input type="password" required className="w-full max-w-md p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">تأكيد كلمة المرور</label>
                    <input type="password" required className="w-full max-w-md p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                      <Key className="w-4 h-4" /> تحديث البيانات
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* تبويب الإشعارات */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">إعدادات التنبيهات</h2>
              <div className="space-y-4 max-w-md">
                
                <label className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                  <div>
                    <p className="text-white font-medium text-sm">تنبيهات المواعيد</p>
                    <p className="text-gray-500 text-xs mt-1">إرسال رسالة تذكير للمريض قبل الموعد بـ 24 ساعة</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                  <div>
                    <p className="text-white font-medium text-sm">تنبيهات الأقساط</p>
                    <p className="text-gray-500 text-xs mt-1">إشعار للمرضى المتأخرين عن السداد</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-blue-600" />
                </label>

              </div>
              <div className="pt-4">
                <button onClick={handleDummySave} disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all">
                  {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </div>
          )}

          {/* تبويب النسخ الاحتياطي */}
          {activeTab === "backup" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">تصدير وحفظ البيانات</h2>
              <p className="text-sm text-gray-400 max-w-lg leading-relaxed">
                حافظ على أمان بيانات عيادتك عبر أخذ نسخة احتياطية دورية. يمكنك تصدير جداول المرضى، المواعيد، والمالية.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl pt-2">
                {/* رابط التحميل المباشر لملف الإكسيل */}
                <a 
                  href="/api/export" 
                  download
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-black/40 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-2xl transition-all group cursor-pointer"
                >
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium text-sm">تصدير لملف Excel</p>
                    <p className="text-gray-500 text-xs mt-1">بيانات المرضى والمالية</p>
                  </div>
                </a>

                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-black/40 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl transition-all group">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full group-hover:scale-110 transition-transform">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium text-sm">نسخة كاملة (Database)</p>
                    <p className="text-gray-500 text-xs mt-1">للمطورين فقط</p>
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}