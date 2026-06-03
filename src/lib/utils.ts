// دالة لتنسيق الأرقام بناءً على العملة المختارة
export function formatCurrency(amount: number, currency: string = 'SYP') {
  const symbol = currency === 'USD' ? '$' : 'ل.س';
  
  // تنسيق الرقم (مثلاً 1000000 -> 1,000,000)
  const formattedNumber = new Intl.NumberFormat('ar-EG').format(amount);
  
  return `${formattedNumber} ${symbol}`;
}