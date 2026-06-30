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

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) this.props.onError(error);
    // Could log errorInfo if needed
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env?.DEV ?? false;
      const message = isDev && this.state.error
        ? this.state.error.message
        : "See the browser console for details.";
      const content = this.props.fallback ?? (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          <p className="text-sm font-medium">An unexpected error occurred.</p>
          <p className="text-xs font-mono break-all mt-2" aria-live="polite">{message}</p>
        </div>
      );
      return content;
    }
    return this.props.children;
  }
}
