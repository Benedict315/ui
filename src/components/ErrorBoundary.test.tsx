import { fireEvent,render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

const ThrowError = () => {
  throw new Error("Test error!");
};

let originalEnv: string | undefined;

beforeEach(() => {
  originalEnv = process.env.NODE_ENV;
});

describe("ErrorBoundary", () => {
  it("renders default fallback when child throws, and resets when try again is clicked", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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

    consoleSpy.mockRestore();
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
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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

    consoleSpy.mockRestore();
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
    const errorArg = onErrorSpy.mock.calls[0][0];
    const infoArg = onErrorSpy.mock.calls[0][1];

    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toBe("Test error!");
    expect(infoArg).toHaveProperty("componentStack");

    consoleSpy.mockRestore();
  });

  it("does not call console.error in production mode when onError is provided", () => {
    process.env.NODE_ENV = "production";
    const onErrorSpy = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onErrorSpy}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it("calls console.error in development mode by default", () => {
    process.env.NODE_ENV = "development";
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

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it("reset key triggers component remount rather than re-render", () => {
    let mountCount = 0;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const TestComponent = () => {
      mountCount++;
      if (mountCount === 1) {
        throw new Error("First mount error");
      }
      return <div data-testid="test-content">Mounted successfully</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // First mount throws error
    expect(mountCount).toBe(1);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click reset to trigger remount
    const resetBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(resetBtn);

    // Component should be remounted (mountCount increases)
    expect(mountCount).toBe(2);
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Mounted successfully")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
