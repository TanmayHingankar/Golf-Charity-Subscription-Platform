"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function AdminPage() {
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data.users,
  });
  const analytics = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await api.get("/admin/analytics")).data,
  });
  const draws = useQuery({
    queryKey: ["draws"],
    queryFn: async () => (await api.get("/draws")).data.draws,
  });
  const winners = useQuery({
    queryKey: ["admin-winners"],
    queryFn: async () => (await api.get("/winners")).data.winners,
  });

  const createDraw = useMutation({
    mutationFn: async () => (await api.post("/draws/create", { method: "random" })).data.draw,
    onSuccess: () => {
      toast.success("Draw created");
      draws.refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const runDraw = useMutation({
    mutationFn: async (id: string) => api.post(`/draws/${id}/run`),
    onSuccess: () => {
      toast.success("Draw executed");
      draws.refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const approve = useMutation({
    mutationFn: async (id: string) => api.post(`/winners/${id}/approve`),
    onSuccess: () => {
      toast.success("Approved");
      winners.refetch();
    },
  });
  const reject = useMutation({
    mutationFn: async (id: string) => api.post(`/winners/${id}/reject`),
    onSuccess: () => {
      toast.success("Rejected");
      winners.refetch();
    },
  });

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs uppercase text-slate-500">Users</p>
          <p className="text-2xl font-semibold">{users.data?.length ?? "-"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-slate-500">Active Subs</p>
          <p className="text-2xl font-semibold">{analytics.data?.activeSubs ?? "-"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-slate-500">Total Draws</p>
          <p className="text-2xl font-semibold">{analytics.data?.drawCount ?? "-"}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Draw Control</h2>
          <Button onClick={() => createDraw.mutate()} disabled={createDraw.isPending}>Create draw</Button>
        </div>
        <div className="space-y-2">
          {draws.data?.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <p className="font-semibold">{d.draw_month}</p>
                <p className="text-sm text-slate-600">{d.status}</p>
              </div>
              <Button variant="ghost" onClick={() => runDraw.mutate(d.id)} disabled={runDraw.isPending || d.status === "completed"}>
                Run draw
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Winners Verification</h2>
        <div className="space-y-2">
          {winners.data?.map((w: any) => (
            <div key={w.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <p className="font-semibold">Match {w.match_count}</p>
                <p className="text-sm text-slate-600">Prize ${(w.prize_cents / 100).toFixed(2)}</p>
                <p className="text-sm">Status: {w.status}</p>
              </div>
              <div className="space-x-2">
                <Button variant="ghost" onClick={() => approve.mutate(w.id)}>Approve</Button>
                <Button variant="ghost" onClick={() => reject.mutate(w.id)}>Reject</Button>
              </div>
            </div>
          ))}
          {(!winners.data || winners.data.length === 0) && <p className="text-slate-500">No winners yet.</p>}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Users</h2>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3 capitalize">{u.role}</td>
                  <td className="py-2 pr-3">{u.is_subscribed ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
