import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { FeeEstimator } from "./FeeEstimator";

vi.mock("@/lib/client", () => ({
  getClient: vi.fn(),
}));

import type { SorokitClient } from "@/lib/client";
import { getClient } from "@/lib/client";

function mockEstimateFee(result: { data: { baseFee: string; recommended: string } | null; error: string | null }) {
  vi.mocked(getClient).mockReturnValue({
    transaction: {
      estimateFee: vi.fn().mockResolvedValue(result),
    },
  } as unknown as SorokitClient);
}

describe("FeeEstimator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the loading skeleton before data arrives", () => {
    // Never resolves during this test
    vi.mocked(getClient).mockReturnValue({
      transaction: {
        estimateFee: vi.fn().mockReturnValue(new Promise(() => {})),
      },
    } as unknown as SorokitClient);

    const { container } = render(<FeeEstimator />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders fee cell values after data loads", async () => {
    mockEstimateFee({ data: { baseFee: "100", recommended: "500" }, error: null });
    render(<FeeEstimator />);

    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
    });
    expect(screen.getByText("Base Fee")).toBeInTheDocument();
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("renders the error message and a retry button when the client returns an error", async () => {
    let callCount = 0;
    vi.mocked(getClient).mockReturnValue({
      transaction: {
        estimateFee: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: null, error: "Rate limit exceeded" });
          } else {
            return Promise.resolve({ data: { baseFee: "150", recommended: "600" }, error: null });
          }
        }),
      },
    } as unknown as SorokitClient);

    render(<FeeEstimator />);

    // Initial check for error state
    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Retry" });
    expect(retryButton).toBeInTheDocument();

    // Click retry
    fireEvent.click(retryButton);

    // Should resolve with new data, clearing the error
    await waitFor(() => {
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("600")).toBeInTheDocument();
    });
    expect(screen.queryByText("Rate limit exceeded")).not.toBeInTheDocument();
  });

  it("clicking the refresh button triggers a new estimateFee call", async () => {
    const estimateFee = vi.fn().mockResolvedValue({
      data: { baseFee: "100", recommended: "500" },
      error: null,
    });
    vi.mocked(getClient).mockReturnValue({
      transaction: { estimateFee },
    } as unknown as SorokitClient);

    render(<FeeEstimator />);

    // Wait for initial load to complete
    await waitFor(() => expect(screen.getByText("100")).toBeInTheDocument());

    const refreshButton = screen.getByTitle("Refresh");
    fireEvent.click(refreshButton);

    await waitFor(() => expect(estimateFee).toHaveBeenCalledTimes(2));
  });

  it("disables the refresh button while loading", async () => {
    // First call never resolves so component stays in loading state
    vi.mocked(getClient).mockReturnValue({
      transaction: {
        estimateFee: vi.fn().mockReturnValue(new Promise(() => {})),
      },
    } as unknown as SorokitClient);

    render(<FeeEstimator />);
    const refreshButton = screen.getByTitle("Refresh");
    expect(refreshButton).toBeDisabled();
  });

  it("renders the section title", async () => {
    mockEstimateFee({ data: { baseFee: "100", recommended: "200" }, error: null });
    render(<FeeEstimator />);
    expect(screen.getByText("Network Fee")).toBeInTheDocument();
  });

  // ── Accessibility (#120) ──────────────────────────────────────────────────
  describe("accessibility", () => {
    it("labels the refresh button for screen readers", () => {
      mockEstimateFee({ data: { baseFee: "100", recommended: "200" }, error: null });
      render(<FeeEstimator />);
      // Announced via aria-label, not the (unreliable) title attribute.
      expect(
        screen.getByRole("button", { name: "Refresh fee estimate" }),
      ).toBeInTheDocument();
    });

    it("announces fee updates via a polite live region", async () => {
      mockEstimateFee({ data: { baseFee: "100", recommended: "500" }, error: null });
      const { container } = render(<FeeEstimator />);
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
      await waitFor(() => expect(liveRegion).toHaveTextContent(/100/));
    });
  });

  // ── XLM conversion and high-fee badge (#185) ───────────────────────────────
  describe("XLM conversion and high-fee badge", () => {
    it("converts stroops to XLM using 10_000_000 divisor", async () => {
      mockEstimateFee({
        data: { baseFee: "10000000", recommended: "20000000" },
        error: null,
      });
      render(<FeeEstimator />);

      await waitFor(() => {
        // 10000000 stroops = 1 XLM
        expect(screen.getByText(/1\.0000000 XLM/)).toBeInTheDocument();
        // 20000000 stroops = 2 XLM
        expect(screen.getByText(/2\.0000000 XLM/)).toBeInTheDocument();
      });
    });

    it("shows high-fee badge when recommended > 2x base fee", async () => {
      mockEstimateFee({
        data: { baseFee: "100", recommended: "250" }, // 250 > 2*100
        error: null,
      });
      render(<FeeEstimator />);

      await waitFor(() => {
        expect(screen.getByText("High fee")).toBeInTheDocument();
      });
    });

    it("does not show high-fee badge when recommended <= 2x base fee", async () => {
      mockEstimateFee({
        data: { baseFee: "100", recommended: "200" }, // 200 = 2*100
        error: null,
      });
      render(<FeeEstimator />);

      await waitFor(() => {
        expect(screen.getByText("100")).toBeInTheDocument();
      });

      // High fee badge should not be present
      expect(screen.queryByText("High fee")).not.toBeInTheDocument();
    });

    it("shows high-fee badge only when recommended is strictly greater than 2x base", async () => {
      mockEstimateFee({
        data: { baseFee: "100", recommended: "201" }, // 201 > 2*100
        error: null,
      });
      render(<FeeEstimator />);

      await waitFor(() => {
        expect(screen.getByText("High fee")).toBeInTheDocument();
      });
    });

    it("handles fractional stroops correctly in XLM conversion", async () => {
      mockEstimateFee({
        data: { baseFee: "123456", recommended: "654321" },
        error: null,
      });
      render(<FeeEstimator />);

      await waitFor(() => {
        // 123456 / 10000000 = 0.0123456 XLM
        expect(screen.getByText(/0\.0123456 XLM/)).toBeInTheDocument();
        // 654321 / 10000000 = 0.0654321 XLM
        expect(screen.getByText(/0\.0654321 XLM/)).toBeInTheDocument();
      });
    });
  });
});
