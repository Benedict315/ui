import { fireEvent,render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { BalanceList } from "./BalanceList";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

vi.mock("@/components/AssetBadge", () => ({
  AssetBadge: ({ balance }: { balance: { asset: string } }) => (
    <span data-testid="asset-badge">{balance.asset}</span>
  ),
}));

vi.mock("@/components/ui/Skeleton", () => ({
  AssetRowSkeleton: () => <div data-testid="skeleton-row" />,
}));

vi.mock("@/components/ui/Badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const mockXlmBalance = { asset: "XLM", balance: "100.0000000", assetType: "native" as const };
const mockAbcBalance = {
  asset: "ABC",
  balance: "25.0000000",
  assetType: "credit_alphanum4" as const,
  assetCode: "ABC",
  assetIssuer: "GABCDEFGHJKLMNPQRSTUVWXYZ1234567890ABCDEFGH",
};
const mockUsdtZeroBalance = {
  asset: "USDT",
  balance: "0.0000000",
  assetType: "credit_alphanum4" as const,
  assetCode: "USDT",
  assetIssuer: "GB6USDTISSUERABCDEFGHIJKLMNOPQRSTUVWXYZ12345",
};
const mockUsdcBalance = {
  asset: "USDC",
  balance: "50.0000000",
  assetType: "credit_alphanum4" as const,
  assetCode: "USDC",
  assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

describe("BalanceList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Connect your wallet' prompt when not connected", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [],
      isLoadingAccount: false,
      isConnected: false,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("skeleton-row")).not.toBeInTheDocument();
  });

  it("renders loading skeletons when connected and loading", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [],
      isLoadingAccount: true,
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);
    expect(screen.getAllByTestId("skeleton-row")).toHaveLength(3);
    expect(screen.queryByText(/no assets/i)).not.toBeInTheDocument();
  });

  it("renders 'No assets found' when connected, not loading, and balances are empty", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [],
      isLoadingAccount: false,
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);
    expect(screen.getByText(/no assets found/i)).toBeInTheDocument();
    expect(screen.queryByTestId("skeleton-row")).not.toBeInTheDocument();
  });

  it("renders asset rows when connected with balances", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [mockXlmBalance, mockUsdcBalance],
      isLoadingAccount: false,
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);
    const badges = screen.getAllByTestId("asset-badge");
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveTextContent("XLM");
    expect(badges[1]).toHaveTextContent("USDC");
    expect(screen.queryByText(/no assets found/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("skeleton-row")).not.toBeInTheDocument();
  });

  it("shows asset count badge when connected and loaded", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [mockXlmBalance, mockUsdcBalance],
      isLoadingAccount: false,
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);
    expect(screen.getByText("2 assets")).toBeInTheDocument();
  });

  it("formats balance amounts to 2–4 decimal places", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [{ ...mockXlmBalance, balance: "1234.5678900" }],
      isLoadingAccount: false,
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);
    expect(screen.getByText(/1[,.]?234/)).toBeInTheDocument();
  });

  it("sorts balances with XLM first, non-zero before zero, and alphabetical order within groups", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [mockUsdtZeroBalance, mockAbcBalance, mockXlmBalance, mockUsdcBalance],
      isLoadingAccount: false,
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);
    const badges = screen.getAllByTestId("asset-badge");
    expect(badges).toHaveLength(4);
    expect(badges[0]).toHaveTextContent("XLM");
    expect(badges[1]).toHaveTextContent("ABC");
    expect(badges[2]).toHaveTextContent("USDC");
    expect(badges[3]).toHaveTextContent("USDT");
  });

  it("renders zero-balance rows with opacity and no-balance label, but not for non-zero assets", () => {
    vi.mocked(useSorokit).mockReturnValue({
      balances: [mockAbcBalance, mockUsdtZeroBalance],
      isLoadingAccount: false,
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<BalanceList />);

    const noBalanceLabel = screen.getByText(/no balance/i);
    expect(noBalanceLabel).toBeInTheDocument();

    const zeroBalanceRow = noBalanceLabel.closest(".border-b");
    expect(zeroBalanceRow).toHaveClass("opacity-50");

    const nonZeroRow = screen.getByText("ABC").closest(".border-b");
    expect(nonZeroRow).not.toHaveClass("opacity-50");
    expect(screen.queryAllByText(/no balance/i)).toHaveLength(1);
  });

  // ── Friendbot link conditional rendering tests (#81) ────────────────────────
  describe("Friendbot link", () => {
    it("renders Friendbot link on testnet with empty balances", () => {
      vi.mocked(useSorokit).mockReturnValue({
        balances: [],
        isLoadingAccount: false,
        isConnected: true,
        network: { name: "testnet" as const, passphrase: "Test SDF Network", rpcUrl: "https://testnet.rpc.com", horizonUrl: "https://testnet.horizon.com" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<BalanceList />);
      expect(screen.getByText(/no assets found/i)).toBeInTheDocument();
      expect(screen.getByText(/fund with friendbot/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /fund with friendbot/i })).toHaveAttribute("href", "https://friendbot.stellar.org");
    });

    it("does not render Friendbot link on mainnet with empty balances", () => {
      vi.mocked(useSorokit).mockReturnValue({
        balances: [],
        isLoadingAccount: false,
        isConnected: true,
        network: { name: "mainnet" as const, passphrase: "Public Global Stellar Network", rpcUrl: "https://mainnet.rpc.com", horizonUrl: "https://mainnet.horizon.com" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<BalanceList />);
      expect(screen.getByText(/no assets found/i)).toBeInTheDocument();
      expect(screen.queryByText(/fund with friendbot/i)).not.toBeInTheDocument();
    });

    it("does not render Friendbot link on testnet with non-empty balances", () => {
      vi.mocked(useSorokit).mockReturnValue({
        balances: [mockXlmBalance],
        isLoadingAccount: false,
        isConnected: true,
        network: { name: "testnet" as const, passphrase: "Test SDF Network", rpcUrl: "https://testnet.rpc.com", horizonUrl: "https://testnet.horizon.com" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<BalanceList />);
      expect(screen.queryByText(/no assets found/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/fund with friendbot/i)).not.toBeInTheDocument();
    });

    it("does not render Friendbot link when not connected", () => {
      vi.mocked(useSorokit).mockReturnValue({
        balances: [],
        isLoadingAccount: false,
        isConnected: false,
        network: { name: "testnet" as const, passphrase: "Test SDF Network", rpcUrl: "https://testnet.rpc.com", horizonUrl: "https://testnet.horizon.com" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<BalanceList />);
      expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument();
      expect(screen.queryByText(/fund with friendbot/i)).not.toBeInTheDocument();
    });

    it("shows a skeleton row count that matches the last known balance count on refresh (#205)", () => {
      // Initial load: no balances loaded yet -> falls back to 3 skeletons.
      const { rerender } = render(<BalanceList />);
      vi.mocked(useSorokit).mockReturnValue({
        balances: [],
        isLoadingAccount: true,
        isConnected: true,
      } as unknown as ReturnType<typeof useSorokit>);
      rerender(<BalanceList />);
      expect(screen.getAllByTestId("skeleton-row")).toHaveLength(3);

      // Balances load: 7 assets.
      const sevenBalances = Array.from({ length: 7 }, (_, i) => ({
        asset: `ASSET${i}`,
        balance: "1.0000000",
        assetType: "credit_alphanum4" as const,
        assetCode: `A${i}`,
        assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      }));
      vi.mocked(useSorokit).mockReturnValue({
        balances: sevenBalances,
        isLoadingAccount: false,
        isConnected: true,
      } as unknown as ReturnType<typeof useSorokit>);
      rerender(<BalanceList />);
      expect(screen.getAllByTestId("asset-badge")).toHaveLength(7);

      // Refresh: loading again, but the last known 7 balances are still in
      // context (not cleared to []) — skeleton count should match 7, not 3.
      vi.mocked(useSorokit).mockReturnValue({
        balances: sevenBalances,
        isLoadingAccount: true,
        isConnected: true,
      } as unknown as ReturnType<typeof useSorokit>);
      rerender(<BalanceList />);
      expect(screen.getAllByTestId("skeleton-row")).toHaveLength(7);
    });

    it("does not render Friendbot link when loading account", () => {
      vi.mocked(useSorokit).mockReturnValue({
        balances: [],
        isLoadingAccount: true,
        isConnected: true,
        network: { name: "testnet" as const, passphrase: "Test SDF Network", rpcUrl: "https://testnet.rpc.com", horizonUrl: "https://testnet.horizon.com" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<BalanceList />);
      expect(screen.getAllByTestId("skeleton-row")).toHaveLength(3);
      expect(screen.queryByText(/fund with friendbot/i)).not.toBeInTheDocument();
    });
  });

  describe("search filter (#352)", () => {
    beforeEach(() => {
      vi.mocked(useSorokit).mockReturnValue({
        balances: [mockXlmBalance, mockAbcBalance, mockUsdcBalance, mockUsdtZeroBalance],
        isLoadingAccount: false,
        isConnected: true,
      } as unknown as ReturnType<typeof useSorokit>);
    });

    it("filters asset rows by code as the user types", () => {
      render(<BalanceList />);
      const search = screen.getByPlaceholderText("Search assets…");

      fireEvent.change(search, { target: { value: "usd" } });

      const badges = screen.getAllByTestId("asset-badge");
      expect(badges.map((b) => b.textContent)).toEqual(["USDC", "USDT"]);
    });

    it("filters case-insensitively", () => {
      render(<BalanceList />);
      const search = screen.getByPlaceholderText("Search assets…");

      fireEvent.change(search, { target: { value: "ABC" } });

      const badges = screen.getAllByTestId("asset-badge");
      expect(badges).toHaveLength(1);
      expect(badges[0]).toHaveTextContent("ABC");
    });

    it("shows 'No matching assets' when the search matches nothing", () => {
      render(<BalanceList />);
      const search = screen.getByPlaceholderText("Search assets…");

      fireEvent.change(search, { target: { value: "zzz-nonexistent" } });

      expect(screen.getByText("No matching assets")).toBeInTheDocument();
      expect(screen.queryAllByTestId("asset-badge")).toHaveLength(0);
    });

    it("restores the full list when the search is cleared", () => {
      render(<BalanceList />);
      const search = screen.getByPlaceholderText("Search assets…");

      fireEvent.change(search, { target: { value: "ABC" } });
      expect(screen.getAllByTestId("asset-badge")).toHaveLength(1);

      fireEvent.change(search, { target: { value: "" } });
      expect(screen.getAllByTestId("asset-badge")).toHaveLength(4);
    });
  });

  describe("sort toggle (#352)", () => {
    beforeEach(() => {
      vi.mocked(useSorokit).mockReturnValue({
        balances: [mockUsdtZeroBalance, mockAbcBalance, mockXlmBalance, mockUsdcBalance],
        isLoadingAccount: false,
        isConnected: true,
      } as unknown as ReturnType<typeof useSorokit>);
    });

    function badgeOrder() {
      return screen.getAllByTestId("asset-badge").map((b) => b.textContent);
    }

    it("starts in Default mode: XLM first, non-zero before zero, alphabetical within groups", () => {
      render(<BalanceList />);
      expect(screen.getByTitle("Sort: Default")).toBeInTheDocument();
      expect(badgeOrder()).toEqual(["XLM", "ABC", "USDC", "USDT"]);
    });

    it("cycles to Balance (desc) mode on the first click", () => {
      render(<BalanceList />);
      fireEvent.click(screen.getByTitle("Sort: Default"));

      expect(screen.getByTitle("Sort: Balance")).toBeInTheDocument();
      // XLM=100, USDC=50, ABC=25, USDT=0 — highest balance first.
      expect(badgeOrder()).toEqual(["XLM", "USDC", "ABC", "USDT"]);
    });

    it("cycles to A-Z (alpha) mode on the second click", () => {
      render(<BalanceList />);
      fireEvent.click(screen.getByTitle("Sort: Default"));
      fireEvent.click(screen.getByTitle("Sort: Balance"));

      expect(screen.getByTitle("Sort: A-Z")).toBeInTheDocument();
      expect(badgeOrder()).toEqual(["ABC", "USDC", "USDT", "XLM"]);
    });

    it("cycles back to Default mode on the third click", () => {
      render(<BalanceList />);
      fireEvent.click(screen.getByTitle("Sort: Default"));
      fireEvent.click(screen.getByTitle("Sort: Balance"));
      fireEvent.click(screen.getByTitle("Sort: A-Z"));

      expect(screen.getByTitle("Sort: Default")).toBeInTheDocument();
      expect(badgeOrder()).toEqual(["XLM", "ABC", "USDC", "USDT"]);
    });

    it("applies the active sort mode on top of the search filter", () => {
      render(<BalanceList />);
      const search = screen.getByPlaceholderText("Search assets…");
      fireEvent.change(search, { target: { value: "us" } });
      fireEvent.click(screen.getByTitle("Sort: Default")); // -> balance-desc

      // USDC=50, USDT=0 — highest balance first, filtered to only the two "us*" assets.
      expect(badgeOrder()).toEqual(["USDC", "USDT"]);
    });
  });
});
