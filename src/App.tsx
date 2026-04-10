export default function App() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(247,179,43,0.28),transparent_40%),linear-gradient(160deg,#10212b_0%,#1e4051_48%,#0d171e_100%)] px-6 py-12 text-stone-100">
      <section className="w-full max-w-3xl rounded-[2rem] border border-white/15 bg-slate-950/55 p-8 shadow-[0_32px_80px_rgba(2,11,16,0.35)] backdrop-blur md:p-12">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-amber-400">
          Roundtable Events Widget
        </p>
        <h1 className="text-4xl leading-none font-semibold text-balance md:text-7xl">
          Vite, React, Bun, and TanStack Query are ready.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-stone-200/85 md:text-lg">
          This scaffold keeps things intentionally lean: no router, no auth, just a clean app shell
          with React Query already wired for API calls.
        </p>
      </section>
    </main>
  );
}
