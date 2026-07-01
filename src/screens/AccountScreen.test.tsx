import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountScreen } from "./AccountScreen";
import { useSorokit } from "@/context/useSorokit";

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

describe("AccountScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSorokit).mockReturnValue({
      isConnected: false,
      isLoadingAccount: false,
      refreshAccount: vi.fn(),
    } as unknown as ReturnType<typeof useSorokit>);
  });

  it("renders the screen heading as a level 2 heading", () => {
    render(<AccountScreen />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Account" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Balances and account details")).toBeInTheDocument();
  });
});
