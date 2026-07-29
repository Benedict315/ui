import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NavSection } from "@/components/Sidebar";

import { Dashboard } from "./Dashboard";

// Dashboard composes every screen; stub the chrome and screens so these tests
// cover only Dashboard's own controlled/uncontrolled section logic.
vi.mock("@/components/Sidebar", () => ({
  Sidebar: ({
    active,
    onNavigate,
  }: {
    active: NavSection;
    onNavigate: (s: NavSection) => void;
  }) => (
    <nav aria-label="Main navigation">
      <span data-testid="sidebar-active">{active}</span>
      {(["wallet", "transactions", "soroban", "network"] as NavSection[]).map(
        (section) => (
          <button key={section} onClick={() => onNavigate(section)}>
            {section}
          </button>
        ),
      )}
    </nav>
  ),
}));
vi.mock("@/components/TopBar", () => ({
  TopBar: ({ active }: { active: NavSection }) => (
    <div data-testid="topbar-active">{active}</div>
  ),
}));
vi.mock("@/components/NetworkBanner", () => ({
  NetworkBanner: () => null,
}));

function stubScreen(name: string) {
  return () => <div data-testid={`screen-${name}`}>{name} screen</div>;
}

vi.mock("@/screens/WalletScreen", () => ({
  WalletScreen: stubScreen("wallet"),
}));
vi.mock("@/screens/AccountScreen", () => ({
  AccountScreen: stubScreen("account"),
}));
vi.mock("@/screens/TransactionsScreen", () => ({
  TransactionsScreen: stubScreen("transactions"),
}));
vi.mock("@/screens/SorobanScreen", () => ({
  SorobanScreen: stubScreen("soroban"),
}));
vi.mock("@/screens/NetworkScreen", () => ({
  NetworkScreen: stubScreen("network"),
}));
vi.mock("@/screens/RecoveryScreen", () => ({
  RecoveryScreen: stubScreen("recovery"),
}));
vi.mock("@/screens/ChartingScreen", () => ({
  ChartingScreen: stubScreen("charts"),
}));
vi.mock("@/screens/YieldFarmingScreen", () => ({
  YieldFarmingScreen: stubScreen("farming"),
}));
vi.mock("@/screens/BudgetScreen", () => ({
  BudgetScreen: stubScreen("budget"),
}));
vi.mock("@/screens/NFTScreen", () => ({
  NFTScreen: stubScreen("nfts"),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("uncontrolled mode", () => {
    it("starts on the Wallet screen by default", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("screen-wallet")).toBeInTheDocument();
    });

    it("initialises to defaultSection when provided", () => {
      render(<Dashboard defaultSection="soroban" />);
      expect(screen.getByTestId("screen-soroban")).toBeInTheDocument();
      expect(screen.queryByTestId("screen-wallet")).not.toBeInTheDocument();
    });

    it("changes the rendered screen when a nav item is clicked", () => {
      render(<Dashboard />);
      fireEvent.click(screen.getByRole("button", { name: "transactions" }));

      expect(screen.getByTestId("screen-transactions")).toBeInTheDocument();
      expect(screen.queryByTestId("screen-wallet")).not.toBeInTheDocument();
    });

    it("still reports navigation through onSectionChange", () => {
      const onSectionChange = vi.fn();
      render(<Dashboard onSectionChange={onSectionChange} />);

      fireEvent.click(screen.getByRole("button", { name: "network" }));

      expect(onSectionChange).toHaveBeenCalledWith("network");
      expect(screen.getByTestId("screen-network")).toBeInTheDocument();
    });
  });

  describe("controlled mode", () => {
    it("renders the screen named by activeSection", () => {
      render(<Dashboard activeSection="transactions" />);
      expect(screen.getByTestId("screen-transactions")).toBeInTheDocument();
      expect(screen.queryByTestId("screen-wallet")).not.toBeInTheDocument();
    });

    it("fires onSectionChange but does not change the screen itself", () => {
      const onSectionChange = vi.fn();
      render(
        <Dashboard
          activeSection="transactions"
          onSectionChange={onSectionChange}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "soroban" }));

      expect(onSectionChange).toHaveBeenCalledWith("soroban");
      // The parent owns the state, so the view is unchanged until it updates.
      expect(screen.getByTestId("screen-transactions")).toBeInTheDocument();
      expect(screen.queryByTestId("screen-soroban")).not.toBeInTheDocument();
    });

    it("follows the parent when activeSection changes", () => {
      const { rerender } = render(<Dashboard activeSection="wallet" />);
      expect(screen.getByTestId("screen-wallet")).toBeInTheDocument();

      rerender(<Dashboard activeSection="network" />);
      expect(screen.getByTestId("screen-network")).toBeInTheDocument();
      expect(screen.queryByTestId("screen-wallet")).not.toBeInTheDocument();
    });

    it("ignores defaultSection when activeSection is set", () => {
      render(<Dashboard activeSection="wallet" defaultSection="soroban" />);
      expect(screen.getByTestId("screen-wallet")).toBeInTheDocument();
    });

    it("passes the active section down to the chrome", () => {
      render(<Dashboard activeSection="soroban" />);
      expect(screen.getByTestId("sidebar-active")).toHaveTextContent("soroban");
      expect(screen.getByTestId("topbar-active")).toHaveTextContent("soroban");
    });
  });
});
