"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';

type Draw = { id: string; draw_month: string; status: string; numbers: number[] };

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  useEffect(() => {
    api.get('/draws')
      .then((r) => setDraws(r.data.draws || []))
      .catch(console.error);
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Recent Draws</h1>
      {draws.length === 0 && <p>No draws available yet.</p>}
      <div className="space-y-3">
        {draws.map((draw) => (
          <Card key={draw.id}>
            <p className="text-sm text-slate-500">{draw.draw_month} - {draw.status}</p>
            <p className="text-xl font-bold">Numbers: {draw.numbers.join(', ')}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
