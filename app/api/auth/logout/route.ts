import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Выход из Supabase
    await supabase.auth.signOut();

    const res = NextResponse.json({ success: true });

    // Удаляем все auth cookies
    res.cookies.delete('sb-access-token');
    res.cookies.delete('sb-refresh-token');
    res.cookies.delete('void-auth-storage');

    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'Logout failed' });
  }
}
