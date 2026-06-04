import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell"; // استدعاء جرس الإشعارات

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#050505] text-gray-200 min-h-screen flex w-full">
      
      {/* القائمة الجانبية */}
      <Sidebar />

      {/* محتوى الصفحة الرئيسية مع إزاحة بمقدار عرض القائمة الجانبية */}
      <main className="flex-1 mr-64 flex flex-col h-screen overflow-hidden">
        
        {/* الشريط العلوي (Header) الزجاجي */}
        <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl z-10 sticky top-0">
          <div>
            <h2 className="text-lg font-bold text-white">لوحة تحكم العيادة</h2>
            <p className="text-xs text-gray-400 mt-1">مرحباً بك في نظام Nexor الطبي</p>
          </div>
          
          {/* قسم الإشعارات والملف الشخصي */}
          <div className="flex items-center gap-5">
            
            {/* جرس الإشعارات الذكي */}
            <NotificationBell />
            
            {/* فاصل عمودي */}
            <div className="h-8 w-px bg-white/10"></div>
            
            {/* صورة/أيقونة الطبيب */}
            <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-xl transition-colors">
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-white">د. طبيب العيادة</p>
                <p className="text-xs text-blue-400">مدير النظام</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                <span className="text-white font-bold text-sm">د</span>
              </div>
            </div>
            
          </div>
        </header>

        {/* محتوى الصفحات المتغير (Children) */}
        <div className="flex-1 p-8 overflow-y-auto scroll-smooth">
          {children}
        </div>
        
      </main>
      
    </div>
  );
}