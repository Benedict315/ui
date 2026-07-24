import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

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

type Ctx = ReturnType<typeof useSorokit>;

function mockContext(overrides: Partial<Ctx> = {}) {
  vi.mocked(useSorokit).mockReturnValue({
    isConnected: false,
    isLoadingAccount: false,
    refreshAccount: vi.fn(),
    ...overrides,
  } as unknown as Ctx);
}

describe("AccountScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext();
  });

  it("renders the screen heading as a level 2 heading", () => {
    render(<AccountScreen />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Account" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Balances and account details")).toBeInTheDocument();
  });

  describe("refresh control (#81)", () => {
    it("does not render the refresh button when disconnected", () => {
      mockContext({ isConnected: false });
      render(<AccountScreen />);
      expect(
        screen.queryByRole("button", { name: /refresh account data/i }),
      ).not.toBeInTheDocument();
    });

    it("renders the refresh button when connected", () => {
      mockContext({ isConnected: true });
      render(<AccountScreen />);
      expect(
        screen.getByRole("button", { name: /refresh account data/i }),
      ).toBeInTheDocument();
    });

    it("disables the refresh button while isLoadingAccount is true", () => {
      mockContext({ isConnected: true, isLoadingAccount: true });
      render(<AccountScreen />);
      const button = screen.getByRole("button", {
        name: /refresh account data/i,
      });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("keeps the refresh button enabled when not loading", () => {
      mockContext({ isConnected: true, isLoadingAccount: false });
      render(<AccountScreen />);
      expect(
        screen.getByRole("button", { name: /refresh account data/i }),
      ).toBeEnabled();
    });

    it("calls refreshAccount when the refresh button is clicked", async () => {
      const refreshAccount = vi.fn().mockResolvedValue(undefined);
      mockContext({ isConnected: true, refreshAccount });
      render(<AccountScreen />);

      fireEvent.click(
        screen.getByRole("button", { name: /refresh account data/i }),
      );

      expect(refreshAccount).toHaveBeenCalledTimes(1);
      // Let the post-refresh state update settle to avoid act() warnings.
      await waitFor(() =>
        expect(screen.getByText(/last updated/i)).toBeInTheDocument(),
      );
    });
  });

  describe("last updated timestamp (#81)", () => {
    it("does not show a last-updated timestamp before any refresh", () => {
      mockContext({ isConnected: true });
      render(<AccountScreen />);
      expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
    });

    it("shows the last-updated timestamp after refreshAccount resolves", async () => {
      const refreshAccount = vi.fn().mockResolvedValue(undefined);
      mockContext({ isConnected: true, refreshAccount });
      render(<AccountScreen />);

      expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", { name: /refresh account data/i }),
      );

      await waitFor(() =>
        expect(screen.getByText(/last updated/i)).toBeInTheDocument(),
      );
    });
  });
});
