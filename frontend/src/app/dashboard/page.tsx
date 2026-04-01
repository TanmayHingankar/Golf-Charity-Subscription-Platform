"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const profile = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/auth/me")).data.user,
  });

  const scores = useQuery({
    queryKey: ["scores"],
    queryFn: async () => (await api.get("/scores")).data.scores,
    enabled: profile.isSuccess,
  });

  const subscription = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => (await api.get("/subscription")).data.subscription,
    enabled: profile.isSuccess,
  });

  const winnings = useQuery({
    queryKey: ["winnings"],
    queryFn: async () => (await api.get("/winners")).data.winners,
    enabled: profile.isSuccess,
  });

  const addScore = useMutation({
    mutationFn: async (payload: { value: number; played_at: string }) => api.post("/scores", payload),
    onSuccess: () => {
      toast.success("Score added");
      scores.refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const latestDraw = useQuery({
    queryKey: ["draws"],
    queryFn: async () => (await api.get("/draws")).data.draws?.[0],
  });

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Subscription</p>
          {subscription.isLoading ? (
            <Skeleton className="h-6 w-32 mt-2" />
          ) : subscription.data ? (
            <>
              <p className="text-xl font-semibold capitalize">{subscription.data.status}</p>
              <p className="text-sm text-slate-600">Renews {subscription.data.current_period_end ? new Date(subscription.data.current_period_end).toLocaleDateString() : "-"}</p>
              <Link className="text-indigo-600 text-sm underline" href="/subscription">Manage</Link>
            </>
          ) : (
            <Link className="text-indigo-600 text-sm underline" href="/subscription">Start subscription</Link>
          )}
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Charity</p>
          {profile.isLoading ? (
            <Skeleton className="h-6 w-32 mt-2" />
          ) : (
            <>
              <p className="text-xl font-semibold">{profile.data?.charity_pct}% donated</p>
              <Link href="/charities" className="text-indigo-600 text-sm underline">Edit charity</Link>
            </>
          )}
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Winnings</p>
          {winnings.isLoading ? <Skeleton className="h-6 w-24 mt-2" /> : <p className="text-xl font-semibold">{winnings.data?.length || 0} pending</p>}
          <Link href="/winnings" className="text-indigo-600 text-sm underline">View</Link>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Add Score</h2>
              <p className="text-sm text-slate-500">Keep your last 5</p>
            </div>
          </div>
          <form
            className="space-y-3 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const value = Number((form.elements.namedItem("value") as HTMLInputElement).value);
              const played_at = (form.elements.namedItem("played_at") as HTMLInputElement).value;
              addScore.mutate({ value, played_at });
            }}
          >
            <input name="value" type="number" min={1} max={45} required className="w-full rounded-md border px-3 py-2" placeholder="Score (1-45)" />
            <input name="played_at" type="date" required className="w-full rounded-md border px-3 py-2" />
            <Button full disabled={addScore.isPending}>{addScore.isPending ? "Saving..." : "Save score"}</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Latest Scores</h2>
          {scores.isLoading ? (
            <div className="space-y-2 mt-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : scores.isError ? (
            <p className="text-red-600">Failed to load scores.</p>
          ) : scores.data?.length ? (
            <ul className="mt-3 space-y-2">
              {scores.data.map((s: any) => (
                <li key={s.id} className="rounded-md border p-2 flex justify-between">
                  <span>{new Date(s.played_at).toLocaleDateString()}</span>
                  <span className="font-semibold">{s.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 mt-2">No scores yet</p>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-semibold">Latest Draw</h2>
          {latestDraw.isLoading ? (
            <Skeleton className="h-4 w-32 mt-2" />
          ) : latestDraw.data ? (
            <div className="mt-2">
              <p className="text-sm text-slate-500">{latestDraw.data.draw_month} • {latestDraw.data.status}</p>
              <p className="text-2xl font-bold mt-1">{latestDraw.data.numbers.join(", ")}</p>
            </div>
          ) : (
            <p>No draw yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Winnings</h2>
          {winnings.isLoading ? (
            <Skeleton className="h-4 w-40 mt-2" />
          ) : winnings.data?.length ? (
            <ul className="mt-2 space-y-2">
              {winnings.data.map((w: any) => (
                <li key={w.id} className="rounded-md border p-2 flex justify-between">
                  <span>Match {w.match_count}</span>
                  <span className="font-semibold">${(w.prize_cents / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No winnings yet.</p>
          )}
        </Card>
      </div>
    </main>
  );
}
