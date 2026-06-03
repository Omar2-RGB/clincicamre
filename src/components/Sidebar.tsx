'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Banknote, 
  Settings,
  Stethoscope // أيقونة إضافية للعيادة
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'الرئيسية', icon: LayoutDashboard, path: '/' },
    { name: 'المرضى', icon: Users, path: '/patients' },
    { name: 'المواعيد', icon: CalendarDays, path: '/appointments' },
    { name: 'المالية', icon: Banknote, path: '/finances' },
    { name: 'إعدادات العيادة', icon: Stethoscope, path: '/dashboard/clinic-settings' }, // الرابط الجديد
    { name: 'الإعدادات', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-black/40 backdrop-blur-2xl border-l border-white/10 flex flex-col transition-all z-50">
      {/* شعار العيادة */}
      <div className="h-24 flex items-center justify-center border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-l from-blue-400 to-gray-200 bg-clip-text text-transparent">
          عيادة التقويم
        </h1>
      </div>

      {/* روابط القائمة */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path} 
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* قسم سفلي للمستخدم */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-800 to-gray-600 border border-white/20 shadow-md"></div>
          <div>
            <p className="text-sm font-medium text-white">د. طبيب التقويم</p>
            <p className="text-xs text-gray-500">مدير النظام</p>
          </div>
        </div>
      </div>
    </aside>
  );
}