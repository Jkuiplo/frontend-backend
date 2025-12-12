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
import { User, Mail, Lock } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.email || !formData.password) {
      setError(t.fillAllFields);
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError(t.usernameTooShort);
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError(t.invalidEmail);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t.passwordTooShort);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      setLoading(false);

      if (result.success) {
        router.push('/home');
      } else {
        setError(result.error || t.registrationFailed);
      }
    } catch (err) {
      setLoading(false);
      setError(t.registrationFailed);
      console.log(err);
    }
  };

  return (
    <div className="rounded-xl bg-card h-[600px] w-[900px] flex shadow-2xl border">
      <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10 gap-6 px-10">
        <span className="text-4xl font-bold mb-4">{t.signUp}</span>

        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="username">{t.username}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder={t.username}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t.email}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
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
            {loading ? 'Loading...' : t.signUp}
          </Button>
        </form>

        <div className="w-full border border-border my-2" />

        <div className="flex items-center">
          <span className="text-sm">{t.alreadyHaveAccount}</span>
          <Link
            href="/login"
            className="ml-2 text-sm text-primary hover:underline font-medium"
          >
            {t.signIn}
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-primary rounded-r-xl flex flex-col justify-center items-center">
        <Image
          className="invert m-7"
          alt="Void logo"
          src={'/icons/logo_icon.svg'}
          height={200}
          width={200}
        />
        <span className="text-primary-foreground text-7xl font-bold">Void</span>
      </div>
    </div>
  );
}
