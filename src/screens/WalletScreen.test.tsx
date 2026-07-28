import { act,fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import type { SorokitState } from "@/context/sorokit-context";
import { useSorokit } from "@/context/useSorokit";

import { WalletScreen } from "./WalletScreen";

// jsdom has no canvas 2D context by default, which would make QRCode render
// its "failed to load" text fallback for every test in this file. Mock the
// qrcode lib and stub getContext so QRCode renders its real <canvas>, matching
// the setup already established in QRCode.test.tsx.
vi.mock("qrcode", () => ({
  default: {
    toCanvas: vi.fn((canvas, value, options, callback) => {
      if (typeof callback === "function") callback(null);
      return Promise.resolve();
    }),
  },
}));

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

function createMockState(overrides?: Partial<SorokitState>): SorokitState {
  return {
    address: null,
    isConnected: false,
    isConnecting: false,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
    account: null,
    balances: [],
    isLoadingAccount: false,
    refreshAccount: vi.fn(),
    network: null,
    switchNetwork: vi.fn(),
    error: null,
    clearError: vi.fn(),
    ...overrides,
  };
}

describe("WalletScreen", () => {
  const mockDisconnect = vi.fn();
  let getContextSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue({} as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    vi.useRealTimers();
  });

  it("renders active connected state and handles disconnect confirmation", () => {
    vi.mocked(useSorokit).mockReturnValue(createMockState({
      address: "GABC123456",
      isConnected: true,
      disconnectWallet: mockDisconnect,
      network: { name: "testnet", rpcUrl: "https://rpc.com" },
    }));

    render(<WalletScreen />);
    
    expect(screen.getByText("Connected")).toBeInTheDocument();
    
    const disconnectBtn = screen.getByRole("button", { name: "Disconnect" });
    expect(disconnectBtn).toBeInTheDocument();
    expect(disconnectBtn.className).toContain("border-line-2");

    fireEvent.click(disconnectBtn);
    expect(mockDisconnect).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Disconnect?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Disconnect?" }));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it("resets confirmation state to Disconnect after 3 seconds", () => {
    vi.mocked(useSorokit).mockReturnValue(createMockState({
      address: "GABC123456",
      isConnected: true,
      disconnectWallet: mockDisconnect,
      network: null,
    }));

    render(<WalletScreen />);

    const disconnectBtn = screen.getByRole("button", { name: "Disconnect" });

    fireEvent.click(disconnectBtn);
    expect(screen.getByRole("button", { name: "Disconnect?" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole("button", { name: "Disconnect" })).toBeInTheDocument();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  describe("Show QR modal (#351)", () => {
    beforeEach(() => {
      vi.mocked(useSorokit).mockReturnValue(createMockState({
        address: "GABC123456",
        isConnected: true,
        network: { name: "testnet", rpcUrl: "https://rpc.com" },
      }));
    });

    it("is not rendered until 'Show QR' is clicked", () => {
      render(<WalletScreen />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens the modal and renders a QR code when 'Show QR' is clicked", () => {
      render(<WalletScreen />);
      fireEvent.click(screen.getByRole("button", { name: /show qr/i }));

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(within(dialog).getByLabelText("Full-size QR code")).toBeInTheDocument();
      expect(within(dialog).getByText("GABC123456")).toBeInTheDocument();
    });

    it("closes the modal when the Close button is clicked", () => {
      render(<WalletScreen />);
      fireEvent.click(screen.getByRole("button", { name: /show qr/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes the modal when the backdrop is clicked", () => {
      render(<WalletScreen />);
      fireEvent.click(screen.getByRole("button", { name: /show qr/i }));
      const dialog = screen.getByRole("dialog");

      fireEvent.click(dialog);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not close the modal when the inner panel is clicked", () => {
      render(<WalletScreen />);
      fireEvent.click(screen.getByRole("button", { name: /show qr/i }));
      const dialog = screen.getByRole("dialog");

      fireEvent.click(within(dialog).getByText("GABC123456"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("homeDomain and createdAt info cells (#351)", () => {
    it("renders the Home Domain info cell when account.homeDomain is set", () => {
      vi.mocked(useSorokit).mockReturnValue(createMockState({
        address: "GABC123456",
        isConnected: true,
        account: {
          address: "GABC123456",
          sequence: "1",
          subentryCount: 0,
          homeDomain: "example.com",
        },
      }));

      render(<WalletScreen />);
      expect(screen.getByText("Home Domain")).toBeInTheDocument();
      expect(screen.getByText("example.com")).toBeInTheDocument();
    });

    it("does not render the Home Domain info cell when account.homeDomain is absent", () => {
      vi.mocked(useSorokit).mockReturnValue(createMockState({
        address: "GABC123456",
        isConnected: true,
        account: { address: "GABC123456", sequence: "1", subentryCount: 0 },
      }));

      render(<WalletScreen />);
      expect(screen.queryByText("Home Domain")).not.toBeInTheDocument();
    });

    it("renders 'Active Since' with the year account.createdAt was created", () => {
      vi.mocked(useSorokit).mockReturnValue(createMockState({
        address: "GABC123456",
        isConnected: true,
        account: {
          address: "GABC123456",
          sequence: "1",
          subentryCount: 0,
          createdAt: "2019-06-15T00:00:00.000Z",
        },
      }));

      render(<WalletScreen />);
      expect(screen.getByText("Active Since")).toBeInTheDocument();
      expect(screen.getByText("2019")).toBeInTheDocument();
    });

    it("does not render 'Active Since' when account.createdAt is absent", () => {
      vi.mocked(useSorokit).mockReturnValue(createMockState({
        address: "GABC123456",
        isConnected: true,
        account: { address: "GABC123456", sequence: "1", subentryCount: 0 },
      }));

      render(<WalletScreen />);
      expect(screen.queryByText("Active Since")).not.toBeInTheDocument();
    });
  });
});
