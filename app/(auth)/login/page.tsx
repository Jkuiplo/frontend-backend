'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.emailOrUsername || !formData.password) {
      setError(t.fillAllFields);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.emailOrUsername,
          password: formData.password,
        }),
      });

      const result = await response.json();

      setLoading(false);

      if (result.success) {
        router.push('/home');
      } else {
        setError(result.error || t.loginFailed);
      }
    } catch (err) {
      setLoading(false);
      setError(t.loginFailed);
      console.log(err);
    }
  };

  return (
    <div className="rounded-xl bg-card h-[600px] w-[900px] flex shadow-2xl border">
      <div className="flex-1 bg-primary rounded-l-xl flex flex-col justify-center items-center">
        <Image
          className="invert m-7"
          alt="Void logo"
          src={'/icons/logo_icon.svg'}
          height={200}
          width={200}
        />
        <span className="text-primary-foreground text-7xl font-bold">Void</span>
      </div>

      <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10 gap-6 px-10">
        <span className="text-4xl font-bold mb-4">{t.signIn}</span>

        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="emailOrUsername">
              {t.username} / {t.email}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="emailOrUsername"
                type="text"
                placeholder={`${t.username} or ${t.email}`}
                value={formData.emailOrUsername}
                onChange={(e) =>
                  setFormData({ ...formData, emailOrUsername: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t.password}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Loading...' : t.signIn}
          </Button>
        </form>

        <button className="text-sm text-muted-foreground hover:underline">
          {t.forgotPassword}
        </button>

        <div className="w-full border border-border my-2" />

        <div className="flex items-center mt-2">
          <span className="text-sm">{t.notMember}</span>
          <Link
            href="/signup"
            className="ml-2 text-sm text-primary hover:underline font-medium"
          >
            {t.signUpNow}
          </Link>
        </div>
      </div>
    </div>
  );
}
