import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <section className="rounded-2xl bg-white p-10 shadow-md">
        <h1 className="text-4xl font-bold text-indigo-800 mb-4">Digital Heroes Golf Charity Platform</h1>
        <p className="text-lg text-slate-700 mb-6">
          Subscribe, log your Stableford scores, enter monthly draw prizes, and support charities with every plan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/auth/register" className="rounded-xl bg-indigo-600 text-white py-3 px-4 text-center hover:bg-indigo-700">
            Get Started (Signup)
          </Link>
          <Link href="/auth/login" className="rounded-xl bg-slate-800 text-white py-3 px-4 text-center hover:bg-slate-900">
            Login
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-indigo-600 text-indigo-600 py-3 px-4 text-center hover:bg-indigo-50">
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">Score Management</h2>
          <p>Submit latest scores 1-45, keep your last 5 history, and track progress month-to-month.</p>
        </article>
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">Prizes & Draw</h2>
          <p>Automated monthly draws for 5/4/3 matching numbers with jackpot rollover and transparency.</p>
        </article>
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">Charity Impact</h2>
          <p>Choose charity, set donation percentage, and see contributions in your profile.</p>
        </article>
        <article className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">Admin Controls</h2>
          <p>Admin dashboard for draw lifecycle, winner verification, and analytics reports.</p>
        </article>
      </section>
    </main>
  );
}
