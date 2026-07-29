import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { AccountScreen } from "./AccountScreen";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

vi.mock("@/components/AccountCard", () => ({
  AccountCard: () => <div>Account Card</div>,
}));

vi.mock("@/components/BalanceList", () => ({
  BalanceList: () => <div>Balance List</div>,
}));

vi.mock("@/components/ClaimableBalanceCard", () => ({
  ClaimableBalanceCard: () => <div>Claimable Balances</div>,
}));

const mockCreateObjectURL = vi.fn(() => "blob:account-export");
const mockRevokeObjectURL = vi.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

describe("AccountScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the screen heading as a level 2 heading", () => {
    vi.mocked(useSorokit).mockReturnValue({
      isConnected: false,
      isLoadingAccount: false,
      refreshAccount: vi.fn(),
      address: null,
      account: null,
      balances: [],
      network: null,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountScreen />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Account" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Balances and account details")).toBeInTheDocument();
  });

  // ── Export filename + Stellar Expert link (#343) ───────────────────────────
  describe("connected actions (#343)", () => {
    const ADDRESS = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

    it("renders the action button group only when connected", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: false,
        isLoadingAccount: false,
        refreshAccount: vi.fn(),
        address: null,
        account: null,
        balances: [],
        network: null,
      } as unknown as ReturnType<typeof useSorokit>);

      render(<AccountScreen />);

      expect(
        screen.queryByRole("button", { name: "Refresh account data" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("account-export-button"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("account-explorer-link"),
      ).not.toBeInTheDocument();
    });

    it("downloads the export JSON with a sorokit-account-{8chars}.json filename", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: true,
        isLoadingAccount: false,
        refreshAccount: vi.fn(),
        address: ADDRESS,
        account: { sequence: "1", address: ADDRESS },
        balances: [],
        network: { name: "testnet", rpcUrl: "x", horizonUrl: "x", passphrase: "x" },
      } as unknown as ReturnType<typeof useSorokit>);

      let downloadName: string | null = null;
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(function (this: HTMLAnchorElement) {
          downloadName = this.download;
        });

      render(<AccountScreen />);
      fireEvent.click(screen.getByTestId("account-export-button"));

      expect(downloadName).toBe(`sorokit-account-${ADDRESS.slice(0, 8)}.json`);
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:account-export");

      clickSpy.mockRestore();
    });

    it("renders the Stellar Expert link with the testnet-segment URL when connected on testnet", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: true,
        isLoadingAccount: false,
        refreshAccount: vi.fn(),
        address: ADDRESS,
        account: { sequence: "1", address: ADDRESS },
        balances: [],
        network: { name: "testnet", rpcUrl: "x", horizonUrl: "x", passphrase: "x" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<AccountScreen />);

      const link = screen.getByTestId("account-explorer-link");
      expect(link).toHaveAttribute(
        "href",
        `https://stellar.expert/explorer/testnet/account/${ADDRESS}`,
      );
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
      expect(link).toHaveAttribute(
        "aria-label",
        `View ${ADDRESS} on Stellar Expert`,
      );
    });

    it("renders the Stellar Expert link with the public-segment URL when on mainnet", () => {
      vi.mocked(useSorokit).mockReturnValue({
        isConnected: true,
        isLoadingAccount: false,
        refreshAccount: vi.fn(),
        address: ADDRESS,
        account: { sequence: "1", address: ADDRESS },
        balances: [],
        network: { name: "mainnet", rpcUrl: "x", horizonUrl: "x", passphrase: "x" },
      } as unknown as ReturnType<typeof useSorokit>);

      render(<AccountScreen />);

      const link = screen.getByTestId("account-explorer-link");
      expect(link).toHaveAttribute(
        "href",
        `https://stellar.expert/explorer/public/account/${ADDRESS}`,
      );
    });

    it("does not render the Stellar Expert link on networks Stellar Expert does not index (futurenet, localnet)", () => {
      for (const name of ["futurenet", "localnet"]) {
        vi.mocked(useSorokit).mockReturnValue({
          isConnected: true,
          isLoadingAccount: false,
          refreshAccount: vi.fn(),
          address: ADDRESS,
          account: { sequence: "1", address: ADDRESS },
          balances: [],
          network: { name, rpcUrl: "x", horizonUrl: "x", passphrase: "x" },
        } as unknown as ReturnType<typeof useSorokit>);

        const { unmount } = render(<AccountScreen />);
        expect(
          screen.queryByTestId("account-explorer-link"),
        ).not.toBeInTheDocument();
        unmount();
      }
    });
  });
});
