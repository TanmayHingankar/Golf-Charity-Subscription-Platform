import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Heroes Golf Charity Subscription",
  description: "Golf performance tracking, charity impact, and monthly draws",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-slate-50 text-slate-900 min-h-full">
        <QueryClientProvider client={queryClient}>
          <Providers>
            <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-20">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <a href="/" className="font-bold text-xl text-indigo-700">Digital Heroes</a>
                <div className="md:hidden">
                  <details>
                    <summary className="cursor-pointer text-sm text-slate-700">Menu</summary>
                    <nav className="mt-2 flex flex-col gap-2">
                      <a href="/dashboard">Dashboard</a>
                      <a href="/scores">Scores</a>
                      <a href="/charities">Charities</a>
                      <a href="/draws">Draws</a>
                      <a href="/subscription">Subscription</a>
                      <a href="/winnings">Winnings</a>
                      <a href="/admin">Admin</a>
                    </nav>
                  </details>
                </div>
                <nav className="hidden md:flex gap-3">
                  <a href="/dashboard" className="text-sm text-slate-700 hover:text-indigo-700">Dashboard</a>
                  <a href="/scores" className="text-sm text-slate-700 hover:text-indigo-700">Scores</a>
                  <a href="/charities" className="text-sm text-slate-700 hover:text-indigo-700">Charities</a>
                  <a href="/draws" className="text-sm text-slate-700 hover:text-indigo-700">Draws</a>
                  <a href="/subscription" className="text-sm text-slate-700 hover:text-indigo-700">Subscription</a>
                  <a href="/winnings" className="text-sm text-slate-700 hover:text-indigo-700">Winnings</a>
                  <a href="/admin" className="text-sm text-slate-700 hover:text-indigo-700">Admin</a>
                </nav>
              </div>
            </header>
            {children}
            <Toaster richColors closeButton />
            <ReactQueryDevtools initialIsOpen={false} />
          </Providers>
        </QueryClientProvider>
      </body>
    </html>
  );
}
