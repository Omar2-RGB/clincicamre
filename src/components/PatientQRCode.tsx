'use client';

import { Printer } from 'lucide-react';

export default function PatientQRCode({ 
  patientId, 
  patientName, 
  patientPhone 
}: { 
  patientId: string; 
  patientName: string; 
  patientPhone: string; 
}) {

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>طباعة بطاقة المريض - ${patientName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
              body { 
                font-family: 'Tajawal', sans-serif; 
                display: flex; justify-content: center; align-items: center; 
                height: 100vh; margin: 0; background-color: #f8fafc; 
              }
              .card { 
                text-align: center; background: white; padding: 50px; 
                border-radius: 30px; width: 320px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                border: 1px solid #e2e8f0;
              }
              h1 { font-size: 28px; color: #1e293b; margin-bottom: 5px; }
              .subtitle { color: #64748b; font-size: 14px; margin-bottom: 30px; }
              h2 { font-size: 22px; color: #0f172a; margin: 0; }
              p { color: #475569; margin: 5px 0 25px 0; font-size: 16px; direction: ltr; }
              .qr-box { 
                background: #f1f5f9; padding: 15px; border-radius: 20px; 
                display: inline-block; margin-bottom: 20px; 
              }
              .footer { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>عيادة التقويم</h1>
              <div class="subtitle">بطاقة بيانات المريض</div>
              
              <h2>${patientName}</h2>
              <p>${patientPhone}</p>
              
              <div class="qr-box">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/patients/${patientId}" width="180" alt="QR Code" />
              </div>
              
              <div class="footer">Scan for Medical Record</div>
            </div>
            <script>
              window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <button 
      onClick={handlePrint} 
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all shadow-lg hover:shadow-blue-500/20"
    >
      <Printer className="w-4 h-4 text-blue-400" /> طباعة البطاقة
    </button>
  );
}