import { prisma } from '@/lib/prisma';
import FinancesClient from './FinancesClient';
import FinancialChart from '@/components/FinancialChart';
import { getFinancialReport } from '@/app/actions/finances';

// تعريف نوع البيانات
type DueInstallment = {
  id: string;
  patientId: string;
  patientName: string;
  totalCost: number;
  paid: number;
  remaining: number;
  status: string;
};

export default async function FinancesPage() {
  // 1. جلب البيانات الأساسية والتقارير المالية بالتوازي
  const [clinicProfile, chartData] = await Promise.all([
    prisma.clinicProfile.findFirst(),
    getFinancialReport()
  ]);
  
  const currency = clinicProfile?.currency || 'SYP';

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 2. جلب إيرادات ومصروفات الشهر الحالي
  const [monthlyPayments, monthlyExpensesObj] = await Promise.all([
    prisma.payment.aggregate({ where: { paymentDate: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: startOfMonth } }, _sum: { amount: true } })
  ]);

  const totalIncome = monthlyPayments._sum.amount || 0;
  const totalExpenses = monthlyExpensesObj._sum.amount || 0;
  const netProfit = totalIncome - totalExpenses;

  // 3. حساب الأقساط المستحقة
  const activeCases = await prisma.case.findMany({
    where: { status: 'جاري' },
    include: { patient: true, payments: true }
  });

  let totalDebts = 0;
  const dueInstallments: DueInstallment[] = [];

  activeCases.forEach((c) => {
    const paid = c.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = c.totalCost - paid;
    if (remaining > 0) {
      totalDebts += remaining;
      dueInstallments.push({
        id: c.id,
        patientId: c.patientId,
        patientName: c.patient.fullName,
        totalCost: c.totalCost,
        paid: paid,
        remaining: remaining,
        status: remaining > (c.totalCost * 0.5) ? 'متأخر جداً' : 'مستحق',
      });
    }
  });

  // 4. جلب آخر الحركات المالية
  const [latestPayments, latestExpenses] = await Promise.all([
    prisma.payment.findMany({ take: 5, orderBy: { paymentDate: 'desc' }, include: { case: { include: { patient: true } } } }),
    prisma.expense.findMany({ take: 5, orderBy: { expenseDate: 'desc' } })
  ]);

  const transactions = [
    ...latestPayments.map(p => ({
      id: `p-${p.id}`, type: 'income' as const, title: `دفعة من: ${p.case.patient.fullName}`, amount: p.amount, date: p.paymentDate
    })),
    ...latestExpenses.map(e => ({
      id: `e-${e.id}`, type: 'expense' as const, title: `مصروف: ${e.category} ${e.description ? `(${e.description})` : ''}`, amount: e.amount, date: e.expenseDate
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  // 5. عرض المكونات
  return (
    <div className="space-y-6">
      {/* الرسم البياني للأداء المالي */}
      <FinancialChart data={chartData} />
      
      {/* المكون الأساسي للبيانات */}
      <FinancesClient 
        kpis={{ totalIncome, totalExpenses, netProfit, totalDebts }}
        dueInstallments={dueInstallments.sort((a, b) => b.remaining - a.remaining)}
        transactions={transactions}
        currency={currency}
      />
    </div>
  );
}