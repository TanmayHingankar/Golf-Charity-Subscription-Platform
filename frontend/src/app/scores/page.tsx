"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ScoresPage() {
  const [value, setValue] = useState('');
  const [playedAt, setPlayedAt] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/scores', { value, played_at: playedAt });
      setMsg('Score saved');
      toast.success('Score saved');
    } catch (e: any) {
      setMsg(e.message);
      toast.error(e.message);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Add Score</h1>
      <form className="space-y-3 mt-4" onSubmit={handleSubmit}>
        <input type="number" min={1} max={45} required value={value} onChange={(e) => setValue(e.target.value)} placeholder="Stableford score (1-45)" className="w-full rounded-md border px-3 py-2" />
        <input type="date" required value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} className="w-full rounded-md border px-3 py-2" />
        <Button>Save</Button>
        {msg && <p className="text-sm mt-2 text-slate-700">{msg}</p>}
      </form>
    </main>
  );
}
