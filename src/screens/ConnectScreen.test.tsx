import { fireEvent,render, screen } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { ConnectScreen } from "./ConnectScreen";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

const BASE_CONTEXT = {
  connectWallet: vi.fn(),
  isConnecting: false,
  error: null,
  clearError: vi.fn(),
};

describe("ConnectScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSorokit).mockReturnValue(
      BASE_CONTEXT as unknown as ReturnType<typeof useSorokit>,
    );
  });

  it("renders the connect wallet button in idle state", () => {
    render(<ConnectScreen />);
    expect(
      screen.getByRole("button", { name: /connect wallet/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Connecting…' button label and status text while connecting", () => {
    vi.mocked(useSorokit).mockReturnValue({
      ...BASE_CONTEXT,
      isConnecting: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<ConnectScreen />);

    expect(screen.getByText("Connecting…")).toBeInTheDocument();
    expect(
      screen.getByText("Connecting to your wallet…"),
    ).toBeInTheDocument();
  });

  it("does not show connecting status text when not connecting", () => {
    render(<ConnectScreen />);
    expect(
      screen.queryByText("Connecting to your wallet…"),
    ).not.toBeInTheDocument();
  });

  it("renders an error banner when an error is present", () => {
    vi.mocked(useSorokit).mockReturnValue({
      ...BASE_CONTEXT,
      error: "Wallet not found",
    } as unknown as ReturnType<typeof useSorokit>);

    render(<ConnectScreen />);

    expect(screen.getByText("Wallet not found")).toBeInTheDocument();
  });

  it("does not render an error banner when there is no error", () => {
    render(<ConnectScreen />);
    expect(screen.queryByText("Wallet not found")).not.toBeInTheDocument();
  });

  it("calls clearError when the dismiss button is clicked", () => {
    const clearError = vi.fn();
    vi.mocked(useSorokit).mockReturnValue({
      ...BASE_CONTEXT,
      error: "Something went wrong",
      clearError,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<ConnectScreen />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const dismissButtons = screen.getAllByRole("button");
    const dismissBtn = dismissButtons.find(
      (btn) => !btn.textContent?.match(/connect/i),
    );
    expect(dismissBtn).toBeDefined();
    fireEvent.click(dismissBtn!);

    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it("calls connectWallet when the connect button is clicked", () => {
    const connectWallet = vi.fn();
    vi.mocked(useSorokit).mockReturnValue({
      ...BASE_CONTEXT,
      connectWallet,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<ConnectScreen />);

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    expect(connectWallet).toHaveBeenCalledTimes(1);
  });

  // ── Wallet option logos (#198) ──────────────────────────────────────────
  it("renders a logo/button for each supported wallet", () => {
    render(<ConnectScreen />);

    for (const wallet of ["Freighter", "xBull", "Lobstr", "Albedo"]) {
      expect(
        screen.getByRole("button", { name: `Connect with ${wallet}` }),
      ).toBeInTheDocument();
    }
  });

  it("calls connectWallet when a wallet option is clicked", () => {
    const connectWallet = vi.fn();
    vi.mocked(useSorokit).mockReturnValue({
      ...BASE_CONTEXT,
      connectWallet,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<ConnectScreen />);
    fireEvent.click(
      screen.getByRole("button", { name: "Connect with Freighter" }),
    );

    expect(connectWallet).toHaveBeenCalledTimes(1);
  });

  it("disables wallet option buttons while connecting", () => {
    vi.mocked(useSorokit).mockReturnValue({
      ...BASE_CONTEXT,
      isConnecting: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<ConnectScreen />);
    expect(
      screen.getByRole("button", { name: "Connect with Freighter" }),
    ).toBeDisabled();
  });

  // ── "New to Stellar?" collapsible section (#198) ────────────────────────
  it("renders a collapsible 'New to Stellar?' section that is closed by default", () => {
    render(<ConnectScreen />);

    const summary = screen.getByText("New to Stellar?");
    expect(summary).toBeInTheDocument();
    const details = summary.closest("details");
    expect(details).not.toHaveAttribute("open");
    expect(
      screen.getByText(/never leaves your device/i),
    ).toBeInTheDocument();
  });

  it("opens the 'New to Stellar?' section when clicked", () => {
    render(<ConnectScreen />);

    const summary = screen.getByText("New to Stellar?");
    fireEvent.click(summary);

    const details = summary.closest("details");
    expect(details).toHaveAttribute("open");
  });
});
