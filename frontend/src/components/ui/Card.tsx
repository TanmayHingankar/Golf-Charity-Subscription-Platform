import { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-2xl bg-white shadow-sm border border-slate-100 p-5", className)}>{children}</div>;
}
