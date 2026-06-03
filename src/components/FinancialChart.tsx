"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialChart({ data }: { data: { month: string; إيرادات: number; مصروفات: number }[] }) {
      return (
    <div className="h-[300px] w-full bg-[#0f172a] p-6 rounded-2xl border border-white/10">
      <h3 className="text-white font-bold mb-4">تحليل الأداء المالي (6 أشهر)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="month" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #333' }} />
          <Area type="monotone" dataKey="إيرادات" stroke="#10b981" fill="#10b98120" />
          <Area type="monotone" dataKey="مصروفات" stroke="#f43f5e" fill="#f43f5e20" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}