export function EventCardSkeleton() {
  return (
    <article className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="h-5 w-32 rounded-full bg-slate-200 dark:bg-zinc-800" />
        <div className="size-5 rounded-full bg-slate-200 dark:bg-zinc-800" />
      </header>

      <div className="aspect-[1/0.92] w-full bg-slate-200 dark:bg-zinc-800" />

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="space-y-2">
          <div className="h-5 w-4/5 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="h-5 w-3/5 rounded-full bg-slate-200 dark:bg-zinc-800" />
        </div>

        <div className="h-6 w-2/3 rounded-full bg-slate-200 dark:bg-zinc-800" />

        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-1/2 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="size-9 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-11/12 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-4/5 rounded-full bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    </article>
  );
}
