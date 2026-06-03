"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, 
  ArrowUpRight, ArrowDownRight, Filter, Receipt, FileText
} from "lucide-react";
import { createExpense } from "@/app/actions/finances";

// تعريفات Typescript الصارمة
interface KPIProps {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalDebts: number;
}

interface DueInstallment {
  id: string;
  patientId: string;
  patientName: string;
  totalCost: number;
  paid: number;
  remaining: number;
  status: string;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  date: Date;
}

export default function FinancesClient({ 
  kpis, 
  dueInstallments, 
  transactions, 
  currency 
}: { 
  kpis: KPIProps, 
  dueInstallments: DueInstallment[], 
  transactions: Transaction[],
  currency: string
}) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("مواد سنية");
  const [expenseNote, setExpenseNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديد الرمز بناءً على العملة المختارة
  const symbol = currency === 'USD' ? '$' : 'ل.س';

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount) return;
    
    setIsSubmitting(true);
    await createExpense(Number(expenseAmount), expenseCategory, expenseNote);
    setIsSubmitting(false);
    setIsExpenseModalOpen(false);
    setExpenseAmount("");
    setExpenseNote("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* الترويسة العلوية */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="text-blue-500" /> الإدارة المالية
          </h1>
          <p className="text-xs text-gray-400 mt-1">ملخص الإيرادات، المصروفات، والأقساط المستحقة لشهر {new Date().toLocaleString('ar-EG', { month: 'long' })}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-sm hover:bg-white/5 transition-all text-gray-300">
            <Filter className="w-4 h-4" /> تصفية
          </button>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-xl font-medium transition-all flex items-center gap-2 text-sm shadow-lg shadow-rose-900/20"
          >
            <Plus className="w-4 h-4" /> تسجيل مصروف
          </button>
        </div>
      </div>

      {/* 1. بطاقات المؤشرات (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* بطاقة الإيرادات */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-1">إيرادات الشهر</p>
            <h3 className="text-2xl font-bold text-white">{kpis.totalIncome.toLocaleString()} <span className="text-sm text-gray-500 font-normal">{symbol}</span></h3>
          </div>
        </div>

        {/* بطاقة المصروفات */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-1">مصروفات الشهر</p>
            <h3 className="text-2xl font-bold text-white">{kpis.totalExpenses.toLocaleString()} <span className="text-sm text-gray-500 font-normal">{symbol}</span></h3>
          </div>
        </div>

        {/* بطاقة الصافي */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-1">صافي الربح التقديري</p>
            <h3 className="text-2xl font-bold text-white">{kpis.netProfit.toLocaleString()} <span className="text-sm text-gray-500 font-normal">{symbol}</span></h3>
          </div>
        </div>

        {/* بطاقة الأقساط المتأخرة */}
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden group shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-amber-200/70 mb-1">ديون وأقساط في السوق</p>
            <h3 className="text-2xl font-bold text-amber-400">{kpis.totalDebts.toLocaleString()} <span className="text-sm text-amber-500/50 font-normal">{symbol}</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. الأقساط المستحقة */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">المرضى المتبقي عليهم أقساط</h2>
          </div>
          
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-sm text-right">
                <thead className="bg-white/5 text-gray-400 sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 font-medium">اسم المريض</th>
                    <th className="px-4 py-3 font-medium">إجمالي الخطة</th>
                    <th className="px-4 py-3 font-medium text-rose-400">المتبقي للدفع</th>
                    <th className="px-4 py-3 font-medium text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dueInstallments.length > 0 ? dueInstallments.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-white font-medium">{item.patientName}</td>
                      <td className="px-4 py-4 text-gray-400">{item.totalCost.toLocaleString()} {symbol}</td>
                      <td className="px-4 py-4 text-amber-400 font-bold">{item.remaining.toLocaleString()} {symbol}</td>
                      <td className="px-4 py-4 text-center">
                        <Link href={`/patients/${item.patientId}`} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all mx-auto w-fit">
                          <FileText className="w-3.5 h-3.5" /> فتح الملف للتحصيل
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">لا يوجد ديون مستحقة حالياً.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. سجل الحركات الأخير */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">آخر الحركات المالية</h2>
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-4 space-y-3 shadow-lg">
            {transactions.length > 0 ? transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1">{tx.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} {symbol}
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-gray-500 py-6">لا توجد حركات مالية مسجلة.</p>
            )}
          </div>
        </div>
      </div>

      {/* نافذة إضافة مصروف */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Receipt className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">تسجيل مصروف جديد</h2>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddExpense}>
              <div>
                <label className="block text-xs text-gray-400 mb-1">المبلغ ({symbol})</label>
                <input required type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder={`مثال: 50000 ${symbol}`} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-rose-500 text-sm" />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">التصنيف</label>
                <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-rose-500 text-sm">
                  <option value="مواد سنية">مواد سنية</option>
                  <option value="أجور مخبر">أجور مخبر</option>
                  <option value="إيجار">إيجار</option>
                  <option value="رواتب">رواتب</option>
                  <option value="فواتير">فواتير</option>
                  <option value="مصاريف أخرى">مصاريف أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">البيان / ملاحظات (اختياري)</label>
                <input type="text" value={expenseNote} onChange={(e) => setExpenseNote(e.target.value)} placeholder="مثال: شراء مواد..." className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-rose-500 text-sm" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-medium transition-all text-sm disabled:opacity-50">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ المصروف'}
                </button>
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-all border border-white/10 text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}