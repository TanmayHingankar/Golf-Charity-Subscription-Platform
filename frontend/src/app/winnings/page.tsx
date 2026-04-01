"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function WinningsPage() {
  const winnings = useQuery({
    queryKey: ["winnings"],
    queryFn: async () => (await api.get("/winners")).data.winners,
  });

  const upload = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      return api.post(`/winners/${id}/proof`, form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("Proof uploaded");
      winnings.refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Winnings</h1>
      {winnings.isLoading ? (
        <p>Loading...</p>
      ) : winnings.isError ? (
        <p className="text-red-600">Failed to load winnings.</p>
      ) : winnings.data?.length ? (
        winnings.data.map((w: any) => (
          <Card key={w.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Match {w.match_count}</p>
                <p className="text-xl font-semibold">${(w.prize_cents / 100).toFixed(2)}</p>
                <p className="text-sm">Status: {w.status}</p>
              </div>
              <div className="space-y-2 text-right">
                <label className="text-sm text-indigo-600 cursor-pointer">
                  Upload proof
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) upload.mutate({ id: w.id, file });
                    }}
                  />
                </label>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p>No winnings yet.</p>
      )}
    </main>
  );
}
