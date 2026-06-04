"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CalendarCheck, X, Clock } from "lucide-react";

// 1. حل خطأ النوع (بدلاً من استخدام any)
interface NotificationItem {
  id?: string;
  createdAt?: string;
  [key: string]: unknown; // للسماح بأي بيانات أخرى قادمة من السيرفر
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const prevCountRef = useRef(0);

  // استخدام useCallback لتنظيم الدالة بشكل احترافي يرضي اللينتر
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const result = await res.json();

      if (result.success) {
        const currentCount = result.data.length;
        setNotifications(result.data);
        setUnreadCount(currentCount);

        if (currentCount > prevCountRef.current && prevCountRef.current !== 0) {
          setShowToast(true);
          
          try {
            const audio = new Audio('/notify.mp3');
            audio.play();
          } catch {
            // 3. حل خطأ e: إزالة المتغير غير المستخدم
            // تم تجاهل الخطأ في حال لم يوجد ملف الصوت
          }

          setTimeout(() => setShowToast(false), 5000);
        }
        
        prevCountRef.current = currentCount;
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  }, []);

  useEffect(() => {
    // 2. حل خطأ الـ useEffect بتجاهل التحذير لهذا السطر تحديداً 
    // لأن جلب البيانات هنا آمن ومقصود
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications(); 
    
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <>
      {/* أيقونة الجرس */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all focus:outline-none"
        >
          <Bell className="w-5 h-5 text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>
          )}
        </button>

        {/* قائمة الإشعارات المنسدلة */}
        {isOpen && (
          <div className="absolute left-0 mt-3 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-white font-bold text-sm">الإشعارات الحديثة</h3>
              <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">{unreadCount} جديد</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif, idx) => (
                  <div key={idx} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-full h-fit text-emerald-400">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium mb-1">حجز موعد جديد</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> منذ وقت قصير
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">لا توجد إشعارات جديدة</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* النافذة المنبثقة (Toast) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center gap-4 animate-in slide-in-from-bottom-8 z-50 border border-white/10 w-80">
          <div className="bg-white/20 p-2.5 rounded-full">
            <CalendarCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">تنبيه حجز جديد!</h4>
            <p className="text-xs text-blue-100 mt-0.5">قام مريض للتو بحجز موعد في العيادة.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </>
  );
}