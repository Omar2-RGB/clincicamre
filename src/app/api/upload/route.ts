import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) return NextResponse.json({ success: false, message: "لا يوجد ملف" });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // حفظ الصورة في مجلد public/uploads
  // تأكد من وجود المجلد في مشروعك: clinic-dashboard/public/uploads
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = path.join(process.cwd(), 'public/uploads', filename);
  
  await writeFile(filePath, buffer);

  return NextResponse.json({ success: true, url: `/uploads/${filename}` });
}