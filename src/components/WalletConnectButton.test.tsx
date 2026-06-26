import { fireEvent,render, screen } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { WalletConnectButton } from "./WalletConnectButton";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

describe("WalletConnectButton", () => {
  const mockConnect = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Connect Wallet' when not connected", () => {
    (useSorokit as any).mockReturnValue({
      isConnected: false,
      isConnecting: false,
      address: null,
      connectWallet: mockConnect,
      error: null,
      clearError: mockClearError,
    });

    render(<WalletConnectButton />);
    expect(screen.getByRole("button", { name: "Connect Wallet" })).toBeInTheDocument();
  });

  it("triggers connectWallet on click", () => {
    (useSorokit as any).mockReturnValue({
      isConnected: false,
      isConnecting: false,
      address: null,
      connectWallet: mockConnect,
      error: null,
      clearError: mockClearError,
    });

    render(<WalletConnectButton />);
    fireEvent.click(screen.getByRole("button", { name: "Connect Wallet" }));
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("renders loading state when connecting", () => {
    (useSorokit as any).mockReturnValue({
      isConnected: false,
      isConnecting: true,
      address: null,
      connectWallet: mockConnect,
      error: null,
      clearError: mockClearError,
    });

    render(<WalletConnectButton />);
    expect(screen.getByRole("button", { name: "Connecting…" })).toBeInTheDocument();
  });

  it("renders connected state with correct address and aria-label", () => {
    const fullAddress = "GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    (useSorokit as any).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: fullAddress,
      connectWallet: mockConnect,
      error: null,
      clearError: mockClearError,
    });

    render(<WalletConnectButton />);
    const button = screen.getByRole("button", {
      name: `Wallet connected: ${fullAddress}. Click to manage.`,
    });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("GABC12...WXYZ")).toBeInTheDocument();
  });

  it("renders inline error message and handles clearError", () => {
    (useSorokit as any).mockReturnValue({
      isConnected: false,
      isConnecting: false,
      address: null,
      connectWallet: mockConnect,
      error: "Connection failed",
      clearError: mockClearError,
    });

    render(<WalletConnectButton />);
    expect(screen.getByText("Connection failed")).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: "Clear error" });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});
