export function EventsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 px-6 py-12 text-center text-slate-700 dark:border-white/15 dark:bg-zinc-900/70 dark:text-zinc-300">
      <p className="text-lg font-semibold tracking-[-0.02em]">Nessun evento disponibile</p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
        Non ci sono eventi futuri nella prima pagina dei risultati al momento.
      </p>
    </div>
  );
}
