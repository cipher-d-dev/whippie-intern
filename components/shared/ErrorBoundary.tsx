"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches render-time errors in its subtree.
 * Must be a class component; React does not support error boundaries as functions.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this should be sent to an error-reporting service.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <p className="text-sm font-medium text-destructive">
            Something went wrong
          </p>
          <p className="text-xs text-muted-foreground">
            {this.state.error.message}
          </p>
          <button
            onClick={this.reset}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
