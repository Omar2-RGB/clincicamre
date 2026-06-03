'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// تعريف نوع البيانات لحل خطأ any
type ClinicProfileData = {
  doctorName?: string;
  specialty?: string;
  bio?: string;
  avatarUrl?: string;
  mapLink?: string;
  workingHours?: string;
  gallery?: string;
  currency?: string;
};

export async function updateClinicProfile(data: ClinicProfileData) {
  try {
    const existingProfile = await prisma.clinicProfile.findFirst();

    if (existingProfile) {
      await prisma.clinicProfile.update({
        where: { id: existingProfile.id },
        data: data,
      });
    } else {
      await prisma.clinicProfile.create({
        data: data,
      });
    }

    revalidatePath('/settings');
    revalidatePath('/patient');
    return { success: true, message: 'تم حفظ الإعدادات بنجاح' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'حدث خطأ أثناء حفظ الإعدادات' };
  }
}

export async function updateCurrencyPreference(currency: string) {
  try {
    const profile = await prisma.clinicProfile.findFirst();
    if (profile) {
      await prisma.clinicProfile.update({
        where: { id: profile.id },
        data: { currency }
      });
    } else {
      await prisma.clinicProfile.create({
        data: { currency }
      });
    }
    
    revalidatePath('/', 'layout');
    return { success: true, message: 'تم تحديث العملة بنجاح' };
  } catch (error) {
    console.error('Error updating currency:', error);
    return { success: false, message: 'حدث خطأ أثناء الحفظ' };
  }
}