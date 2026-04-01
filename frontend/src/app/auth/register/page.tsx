"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password });
      setAuth({ accessToken: res.data.tokens.accessToken, refreshToken: res.data.tokens.refreshToken, user: res.data.user });
      toast.success('Account created');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border px-3 py-2" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md border px-3 py-2" />
        <Button full disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </main>
  );
}
