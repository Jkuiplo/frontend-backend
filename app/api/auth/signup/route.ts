import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { email, password, username } = await req.json();

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (signUpError)
    return NextResponse.json({ success: false, error: signUpError.message });

  // Логиним сразу после signup
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError)
    return NextResponse.json({ success: false, error: signInError.message });

  const user = signInData.user;

  // Формируем структуру для void-auth-storage cookie
  const authStorage = {
    state: {
      user: {
        id: user.id,
        username: user.user_metadata?.username || username,
        email: user.email,
        createdAt: user.created_at,
      },
      isAuthenticated: true,
    },
    version: 0,
  };

  const res = NextResponse.json({ success: true, user: signInData.user });

  // Устанавливаем Supabase токены
  res.cookies.set('sb-access-token', signInData.session?.access_token || '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  res.cookies.set('sb-refresh-token', signInData.session?.refresh_token || '', {
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
