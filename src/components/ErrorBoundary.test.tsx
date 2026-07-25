import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

const ThrowError = () => {
  throw new Error("Test error!");
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("ErrorBoundary", () => {
  it("renders default fallback when child throws, and resets when try again is clicked", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Expect default fallback UI text
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error!")).toBeInTheDocument();

    const resetBtn = screen.getByRole("button", { name: /try again/i });
    expect(resetBtn).toBeInTheDocument();

    // Clicking reset should try to re-render the children
    // (It will just throw again because we always throw in ThrowError, but it resets state)
    fireEvent.click(resetBtn);
  });

  it("renders custom fallback prop and passes error and reset function", () => {
    const fallbackSpy = vi.fn().mockImplementation((error, reset) => (
      <div>
        <p>Custom Fallback</p>
        <p>{error.message}</p>
        <button onClick={reset}>Reset Custom</button>
      </div>
    ));

    // Suppress console.error for expected thrown error
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={fallbackSpy}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(fallbackSpy).toHaveBeenCalled();
    expect(screen.getByText("Custom Fallback")).toBeInTheDocument();
    expect(screen.getByText("Test error!")).toBeInTheDocument();

    const resetBtn = screen.getByText("Reset Custom");
    expect(resetBtn).toBeInTheDocument();

    // Reset should be callable and reset the error state (though it will just throw again because we still render ThrowError)
    // but we can verify it doesn't crash.
    fireEvent.click(resetBtn);
  });

  it("calls onError callback with error and info when child throws", () => {
    const onErrorSpy = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onErrorSpy}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onErrorSpy).toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalledWith(
      "[sorokit-ui] Uncaught error:",
      expect.any(Error),
      expect.any(String)
    );
    const errorArg = onErrorSpy.mock.calls[0][0];
    const infoArg = onErrorSpy.mock.calls[0][1];

    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toBe("Test error!");
    expect(infoArg).toHaveProperty("componentStack");
  });

  it("does not call console.error in production mode", () => {
    vi.stubEnv("DEV", false);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "[sorokit-ui] Uncaught error:",
      expect.any(Error),
      expect.any(String)
    );
  });

  it("calls onError instead of console.error in production mode when provided", () => {
    vi.stubEnv("DEV", false);
    const onErrorSpy = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onErrorSpy}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).not.toHaveBeenCalledWith(
      "[sorokit-ui] Uncaught error:",
      expect.any(Error),
      expect.any(String)
    );
    expect(onErrorSpy).toHaveBeenCalled();
  });

  it("calls console.error in development mode by default", () => {
    vi.stubEnv("DEV", true);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[sorokit-ui] Uncaught error:",
      expect.any(Error),
      expect.any(String)
    );
  });

  it("reset key remounts children with fresh state to avoid an error loop", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    let shouldRecoverAfterReset = false;

    const TestComponent = () => {
      if (!shouldRecoverAfterReset) {
        throw new Error("Corrupted child state");
      }

      return <div data-testid="test-content">Mounted successfully</div>;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const resetBtn = screen.getByRole("button", { name: /try again/i });
    shouldRecoverAfterReset = true;
    fireEvent.click(resetBtn);

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Mounted successfully")).toBeInTheDocument();
  });

  it("applies scoped container styling when isolate is true", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary isolate>
        <ThrowError />
      </ErrorBoundary>
    );

    const scopedFallback = container.firstElementChild;

    expect(scopedFallback).toHaveClass("overflow-hidden");
    expect(scopedFallback).toHaveClass("rounded-xl");
    expect(scopedFallback).toHaveClass("border");
    expect(scopedFallback).toHaveClass("min-h-[260px]");
  });
});
