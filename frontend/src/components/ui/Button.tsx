"use client";
import { cva, VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { ButtonHTMLAttributes } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        ghost: "bg-transparent text-slate-800 hover:bg-slate-100 focus:ring-slate-300",
        danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ variant, full, className, ...props }: Props) {
  return <button className={clsx(buttonStyles({ variant, full }), className)} {...props} />;
}
