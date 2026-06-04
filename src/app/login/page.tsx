"use client";

import {
  Lock,
  Mail,
  ShieldCheck,
  Activity,
  Calendar,
  ArrowLeft,
  Sparkles,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await loginAction(formData);
      if (result.success) {
        router.push("/(dashboard)"); // التوجيه للوحة التحكم بعد النجاح
      } else {
        setError(result.message || "حدث خطأ أثناء تسجيل الدخول");
      }
    } catch (err) {
      setError("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-transparent to-cyan-950/30" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">

        <div className="w-full max-w-7xl rounded-[40px] overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_20px_100px_rgba(0,0,0,0.7)]">

          <div className="flex flex-col lg:flex-row min-h-[780px]">

            {/* Left Side */}
            <div className="lg:w-3/5 p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-white/10">
              <div>
                {/* Logo */}
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-10">
                  <Stethoscope className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-semibold text-lg">
                    Nexor Clinic System
                  </span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                  مستقبل
                  <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    إدارة العيادات
                  </span>
                </h1>

                <p className="mt-8 max-w-2xl text-slate-400 text-lg leading-8">
                  منصة متكاملة لإدارة المرضى والمواعيد والفواتير والجلسات
                  والتقارير الطبية والمالية ضمن تجربة احترافية مصممة خصيصاً
                  لعيادات الأسنان الحديثة.
                </p>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-5 mt-14">
                  {[
                    { title: "حماية متقدمة", desc: "تشفير كامل للبيانات ونسخ احتياطي تلقائي." },
                    { title: "إدارة المواعيد", desc: "تنظيم وجدولة المواعيد بسهولة واحترافية." },
                    { title: "إدارة المرضى", desc: "ملفات متكاملة وصور شعاعية وسجل علاجي." },
                    { title: "تقارير ذكية", desc: "إحصائيات مالية وطبية لحظية." },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all duration-300"
                    >
                      <CheckCircle2 className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition" />
                      <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16">
                <div>
                  <h3 className="text-4xl font-black text-white">150K+</h3>
                  <p className="text-slate-500 mt-2">مريض</p>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-white">99.9%</h3>
                  <p className="text-slate-500 mt-2">استقرار النظام</p>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-white">24/7</h3>
                  <p className="text-slate-500 mt-2">دعم فني</p>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:w-2/5 flex items-center justify-center p-10">
              <div className="w-full max-w-md">

                <div className="mb-10 text-center">
                  <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)] mb-6">
                    <Sparkles className="text-white w-10 h-10" />
                  </div>
                  <h2 className="text-4xl font-black text-white">تسجيل الدخول</h2>
                  <p className="text-slate-400 mt-3">الوصول الآمن إلى لوحة التحكم</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-4 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@nexor.com"
                        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pr-12 pl-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-300">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-4 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pr-12 pl-4 text-white placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                      تذكرني
                    </label>
                    <button type="button" className="text-blue-400 hover:text-blue-300 transition">
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
                    {!isLoading && <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />}
                  </button>
                </form>

                {/* Security Info */}
                <div className="mt-10 pt-8 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <ShieldCheck className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <h4 className="text-white font-bold">SSL</h4>
                      <span className="text-slate-500 text-xs">Secure</span>
                    </div>
                    <div>
                      <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <h4 className="text-white font-bold">99.9%</h4>
                      <span className="text-slate-500 text-xs">Uptime</span>
                    </div>
                    <div>
                      <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <h4 className="text-white font-bold">24/7</h4>
                      <span className="text-slate-500 text-xs">Support</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}