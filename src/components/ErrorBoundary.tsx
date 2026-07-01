/**
 * ErrorBoundary Component
 * 
 * React error boundary that catches errors in child components and displays
 * a user-friendly error message instead of crashing the entire application.
 * 
 * @component
 * @example
 * ```tsx
 * import { ErrorBoundary } from 'sorokit-ui';
 * import { MyComponent } from './MyComponent';
 * 
 * export function App() {
 *   return (
 *     <ErrorBoundary>
 *       <MyComponent />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 * 
 * @param props - Component props
 * @param props.children - Child components to protect
 * @param props.fallback - Optional custom fallback UI (default: error message)
 * @param props.onError - Optional callback when error occurs
 * 
 * @returns The rendered ErrorBoundary or fallback UI on error
 * 
 * @remarks
 * - Only catches errors in child component render and lifecycle
 * - Event handlers should use try/catch
 * - Async errors won't be caught (use Promise catch blocks)
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetKey: number;
}

export function ErrorBoundary({
  children,
  fallback,
  onError,
  isolate,
}: ErrorBoundaryProps) {
  const [state, setState] = React.useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
    resetKey: 0,
  });

  const reset = React.useCallback(() => {
    setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      resetKey: prev.resetKey + 1,
    }));
  }, []);

  const componentDidCatch = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log in development, otherwise delegate to onError if provided
    if (process.env.NODE_ENV === "development") {
      console.error("[sorokit-ui] Uncaught error:", error, errorInfo.componentStack);
    } else if (onError) {
      onError(error, errorInfo);
    }
    setState({ hasError: true, error, errorInfo, resetKey: state.resetKey });
  };

  // Use a class-less pattern: we need lifecycle hook, so use useEffect with error boundary via React error handling is not possible.
  // Instead, create an inner class component to leverage componentDidCatch.
  class Boundary extends React.Component<{ children: React.ReactNode }> {
    componentDidCatch(error: Error, info: React.ErrorInfo) {
      componentDidCatch(error, info);
    }
    render() {
      return this.props.children;
    }
  }

  if (state.hasError) {
    if (fallback) {
      if (typeof fallback === "function") {
        return (fallback as any)(state.error, reset);
      }
      return <>{fallback}</>;
    }
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        <h2>Something went wrong</h2>
        <pre>{state.error?.message}</pre>
        <button onClick={reset} className="mt-2 btn-primary">
          Try again
        </button>
      </div>
    );
  }

  const content = (
    <Boundary key={state.resetKey}>
      {children}
    </Boundary>
  );

  return isolate ? (
    <div className="overflow-hidden rounded-xl">{content}</div>
  ) : (
    content
  );
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  onError?: (error: Error, info: React.ErrorInfo) => void;
  isolate?: boolean;
}


export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}
