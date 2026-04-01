"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const plans = [
  { id: "monthly", name: "Monthly", price: "$10", desc: "Pay monthly, cancel anytime." },
  { id: "yearly", name: "Yearly", price: "$100", desc: "2 months free. Best value." },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => (await api.get("/subscription")).data.subscription,
  });

  const checkout = useMutation({
    mutationFn: async (plan: string) => (await api.post("/subscription/checkout", { plan })).data.url,
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: async () => api.post("/subscription/cancel"),
    onSuccess: () => {
      toast.success("Cancellation scheduled at period end");
      refetch();
    },
  });

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Subscription</h1>

      <Card>
        {isLoading ? (
          <p>Loading...</p>
        ) : !data ? (
          <p>No active subscription.</p>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-xl font-semibold capitalize">{data.status}</p>
              <p className="text-sm text-slate-600">Renews: {data.current_period_end ? new Date(data.current_period_end).toLocaleDateString() : "-"}</p>
            </div>
            <div className="space-x-3">
              <Button variant="ghost" onClick={() => cancel.mutate()} disabled={cancel.isLoading}>
                Cancel at period end
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{plan.name}</p>
                <p className="text-slate-600">{plan.desc}</p>
              </div>
              <p className="text-2xl font-semibold text-indigo-600">{plan.price}</p>
            </div>
            <Button full onClick={() => checkout.mutate(plan.id)} disabled={checkout.isPending}>
              {checkout.isPending ? "Redirecting..." : "Subscribe"}
            </Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
