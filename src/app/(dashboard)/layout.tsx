import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // هنا نستخدم div عادي مع كلاسات الألوان والخلفية الخاصة بلوحة التحكم
    <div className="bg-[#050505] text-gray-200 min-h-screen flex w-full">
      
      {/* استدعاء القائمة الجانبية الزجاجية */}
      <Sidebar />

      {/* محتوى الصفحة الرئيسية مع إزاحة بمقدار عرض القائمة الجانبية */}
      <main className="flex-1 mr-64 p-8 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}