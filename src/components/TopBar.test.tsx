import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { TopBar } from "./TopBar";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

vi.mock("./NetworkSwitcher", () => ({
  NetworkSwitcher: () => <div data-testid="network-switcher" />,
}));

vi.mock("./WalletConnectButton", () => ({
  WalletConnectButton: () => <div data-testid="wallet-connect-button" />,
}));

describe("TopBar", () => {
  const onMenuToggle = vi.fn();
  const clearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title for the active section", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: null,
      clearError,
    } as ReturnType<typeof useSorokit>);
    render(<TopBar active="wallet" onMenuToggle={onMenuToggle} />);
    expect(screen.getByRole("heading", { name: /wallet/i })).toBeInTheDocument();
  });

  it("renders the correct title for different active sections", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: null,
      clearError,
    } as ReturnType<typeof useSorokit>);
    render(<TopBar active="network" onMenuToggle={onMenuToggle} />);
    expect(screen.getByRole("heading", { name: /network/i })).toBeInTheDocument();
  });

  it("does not render the error banner when error is null", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: null,
      clearError,
    } as ReturnType<typeof useSorokit>);
    render(<TopBar active="wallet" onMenuToggle={onMenuToggle} />);
    expect(screen.queryByText(/network unavailable/i)).not.toBeInTheDocument();
  });

  it("renders the error banner with the error message when error is set", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: "Network unavailable",
      clearError,
    } as ReturnType<typeof useSorokit>);
    render(<TopBar active="wallet" onMenuToggle={onMenuToggle} />);
    expect(screen.getByText("Network unavailable")).toBeInTheDocument();
  });

  it("calls clearError when the dismiss button in the error banner is clicked", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: "Something went wrong",
      clearError,
    } as ReturnType<typeof useSorokit>);
    render(<TopBar active="wallet" onMenuToggle={onMenuToggle} />);
    const errorText = screen.getByText("Something went wrong");
    const banner = errorText.closest("div.flex")!;
    const dismissButton = within(banner).getByRole("button");
    fireEvent.click(dismissButton);
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it("calls onMenuToggle when the mobile menu button is clicked", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: null,
      clearError,
    } as ReturnType<typeof useSorokit>);
    render(<TopBar active="wallet" onMenuToggle={onMenuToggle} />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it("renders the title as an h1 element", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: null,
      clearError,
    } as ReturnType<typeof useSorokit>);
    const { container } = render(<TopBar active="wallet" onMenuToggle={onMenuToggle} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(container.querySelector("h1")).toBe(heading);
  });

  it("renders the title text matching the active nav label", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: null,
      clearError,
    } as ReturnType<typeof useSorokit>);
    render(<TopBar active="account" onMenuToggle={onMenuToggle} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Account");
  });

  it("renders only one h1 element", () => {
    vi.mocked(useSorokit).mockReturnValue({
      error: null,
      clearError,
    } as ReturnType<typeof useSorokit>);
    const { container } = render(<TopBar active="wallet" onMenuToggle={onMenuToggle} />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });
});
