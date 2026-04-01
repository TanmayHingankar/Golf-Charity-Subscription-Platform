import { ReactNode } from "react";
import { Card } from "./ui/Card";

export function Stat({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="flex items-center gap-3">
      {icon && <div className="text-indigo-600">{icon}</div>}
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
