import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WalletScreen } from "./WalletScreen";
import { useSorokit } from "@/context/useSorokit";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

describe("WalletScreen", () => {
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders active connected state and handles disconnect confirmation", () => {
    (useSorokit as any).mockReturnValue({
      address: "GABC123456",
      isConnected: true,
      disconnectWallet: mockDisconnect,
      network: { name: "testnet", rpcUrl: "https://rpc.com" },
    });

    render(<WalletScreen />);
    
    // Check initial connect state is visible
    expect(screen.getByText("Connected")).toBeInTheDocument();
    
    // Disconnect button should start as "Disconnect"
    const disconnectBtn = screen.getByRole("button", { name: "Disconnect" });
    expect(disconnectBtn).toBeInTheDocument();
    expect(disconnectBtn.className).toContain("border-line-2"); // secondary style classes

    // First click should switch button label to "Disconnect?"
    fireEvent.click(disconnectBtn);
    expect(mockDisconnect).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Disconnect?" })).toBeInTheDocument();

    // Second click should execute disconnectWallet
    fireEvent.click(screen.getByRole("button", { name: "Disconnect?" }));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it("resets confirmation state to Disconnect after 3 seconds", () => {
    (useSorokit as any).mockReturnValue({
      address: "GABC123456",
      isConnected: true,
      disconnectWallet: mockDisconnect,
      network: null,
    });

    render(<WalletScreen />);

    const disconnectBtn = screen.getByRole("button", { name: "Disconnect" });

    // First click
    fireEvent.click(disconnectBtn);
    expect(screen.getByRole("button", { name: "Disconnect?" })).toBeInTheDocument();

    // Fast-forward 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Label should reset back to "Disconnect"
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeInTheDocument();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it("renders network info cells with copyable passphrase and RPC URL", () => {
    (useSorokit as any).mockReturnValue({
      address: "GABC123456",
      isConnected: true,
      disconnectWallet: mockDisconnect,
      network: {
        name: "testnet",
        rpcUrl: "https://rpc.testnet.example.com",
        passphrase: "Test SDF Network ; September 2015",
      },
    });

    render(<WalletScreen />);

    // Check network name is displayed
    expect(screen.getByText("testnet")).toBeInTheDocument();

    // Check RPC URL is displayed
    expect(screen.getByText("https://rpc.testnet.example.com")).toBeInTheDocument();

    // Check passphrase is displayed if it exists
    expect(screen.getByText("Test SDF Network ; September 2015")).toBeInTheDocument();
  });

  it("has copyable buttons for network info", async () => {
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.assign(navigator, { clipboard });

    (useSorokit as any).mockReturnValue({
      address: "GABC123456",
      isConnected: true,
      disconnectWallet: mockDisconnect,
      network: {
        name: "testnet",
        rpcUrl: "https://rpc.testnet.example.com",
      },
    });

    const { container } = render(<WalletScreen />);

    // Find copy buttons (they have aria-label "Copy value")
    const copyButtons = screen.getAllByLabelText("Copy value");
    expect(copyButtons.length).toBeGreaterThan(0);

    // Click a copy button
    fireEvent.click(copyButtons[0]);

    // Check clipboard was called
    expect(clipboard.writeText).toHaveBeenCalled();
  });

  it("displays QR code for receiving funds when connected", () => {
    (useSorokit as any).mockReturnValue({
      address: "GABC123456",
      isConnected: true,
      disconnectWallet: mockDisconnect,
      network: { name: "testnet", rpcUrl: "https://rpc.com" },
    });

    const { container } = render(<WalletScreen />);

    // Check "Receive Funds" section is visible
    expect(screen.getByText("Receive Funds")).toBeInTheDocument();

    // Check for QR code canvas
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    // Check address is displayed
    expect(screen.getByText(/GABC123456/)).toBeInTheDocument();
  });

  it("does not display QR code when not connected", () => {
    (useSorokit as any).mockReturnValue({
      address: null,
      isConnected: false,
      disconnectWallet: mockDisconnect,
      network: null,
    });

    const { container } = render(<WalletScreen />);

    // Check "Receive Funds" section is not visible
    expect(screen.queryByText("Receive Funds")).not.toBeInTheDocument();

    // Check for QR code canvas
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeInTheDocument();
  });
});
