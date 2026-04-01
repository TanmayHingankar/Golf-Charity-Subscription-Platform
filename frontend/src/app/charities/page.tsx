"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

type Charity = { id: string; name: string; description: string; image_url?: string };

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [pct, setPct] = useState(10);

  const load = async () => {
    const res = await api.get('/charities');
    setCharities(res.data.charities || []);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const saveSelection = async () => {
    try {
      await api.put('/auth/me', { charity_id: selected, charity_pct: pct }); // assuming backend supports
      toast.success('Charity updated');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Charity Directory</h1>
      {charities.length === 0 && <p>No charities found.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {charities.map((charity) => (
          <Card key={charity.id} className={selected === charity.id ? 'ring-2 ring-indigo-500' : ''} onClick={() => setSelected(charity.id)}>
            <h2 className="font-semibold text-lg">{charity.name}</h2>
            <p className="text-sm text-slate-600">{charity.description}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <label className="text-sm font-semibold">Contribution % (min 10)</label>
        <input type="range" min={10} max={50} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full" />
        <p className="text-slate-700">You will donate {pct}% of your subscription to the selected charity.</p>
        <Button onClick={saveSelection} disabled={!selected}>Save</Button>
      </div>
    </main>
  );
}
