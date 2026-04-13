type EventsIntegrationErrorStateProps = {
  message: string;
};

export function EventsIntegrationErrorState({
  message,
}: EventsIntegrationErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
      <p className="text-lg font-semibold tracking-[-0.02em]">
        Il widget non e configurato correttamente
      </p>
      <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">
        Verifica gli attributi <code>data-events</code> e <code>data-theme</code> del
        contenitore.
      </p>
      <p className="mt-4 rounded-lg bg-black/5 px-4 py-3 text-left text-xs leading-5 break-words dark:bg-white/10">
        {message}
      </p>
    </div>
  );
}
