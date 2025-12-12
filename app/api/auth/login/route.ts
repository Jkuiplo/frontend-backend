import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return NextResponse.json({ success: false, error: error.message });

  const user = data.user;

  // Формируем структуру для void-auth-storage cookie
  const authStorage = {
    state: {
      user: {
        id: user.id,
        username:
          user.user_metadata?.username || user.email?.split('@')[0] || '',
        email: user.email,
        createdAt: user.created_at,
      },
      isAuthenticated: true,
    },
    version: 0,
  };

  const res = NextResponse.json({ success: true, user: data.user });

  // Устанавливаем Supabase токены
  res.cookies.set('sb-access-token', data.session?.access_token || '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  res.cookies.set('sb-refresh-token', data.session?.refresh_token || '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  // Устанавливаем void-auth-storage cookie
  res.cookies.set('void-auth-storage', JSON.stringify(authStorage), {
    path: '/',
    httpOnly: false, // Должно быть доступно на клиенте
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
