import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ReactNode } from "react";

type ResettableErrorBoundaryProps = {
  children: ReactNode;
  onReset: () => void;
};

type ResettableErrorBoundaryState = {
  error: Error | null;
};

class ResettableErrorBoundary extends Component<
  ResettableErrorBoundaryProps,
  ResettableErrorBoundaryState
> {
  state: ResettableErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ResettableErrorBoundaryState {
    return { error };
  }

  handleRetry = () => {
    this.props.onReset();
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          <p className="text-lg font-semibold tracking-[-0.02em]">
            Impossibile caricare gli eventi
          </p>
          <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">
            Controlla la connessione e riprova.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200"
          >
            Riprova
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

type EventsQueryBoundaryProps = {
  children: ReactNode;
};

export function EventsQueryBoundary({ children }: EventsQueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ResettableErrorBoundary onReset={reset}>{children}</ResettableErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
