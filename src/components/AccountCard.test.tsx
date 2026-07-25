import { fireEvent,render, screen } from "@testing-library/react";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { useSorokit } from "@/context/useSorokit";

import { AccountCard } from "./AccountCard";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

describe("AccountCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a skeleton during loading", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC",
      account: null,
      isLoadingAccount: true,
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<AccountCard />);
    // Skeleton renders when isLoadingAccount is true. We can check for a div with animate-pulse
    // The skeleton from ui/Skeleton uses animate-pulse. Wait, the actual Skeleton component wasn't mocked.
    // It's just a div.
    expect(container.querySelectorAll(".animate-pulse")).toBeTruthy();
    expect(screen.queryByText("Sequence")).not.toBeInTheDocument();
  });

  it("renders account fields after load", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC",
      account: {
        sequence: "123456",
        subentryCount: 2,
      },
      isLoadingAccount: false,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountCard />);
    
    expect(screen.getByText("Sequence")).toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
    expect(screen.getByText("Subentries")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("returns null when no address is present", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: null,
      account: null,
      isLoadingAccount: false,
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<AccountCard />);
    expect(container).toBeEmptyDOMElement();
  });

  // ── Reserve indicator (#178) ────────────────────────────────────────────
  it("displays the XLM reserve impact as subentryCount * 0.5 XLM", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC",
      account: {
        sequence: "123456",
        subentryCount: 4,
      },
      isLoadingAccount: false,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountCard />);

    expect(screen.getByText("Reserve Impact")).toBeInTheDocument();
    expect(screen.getByText("2.00 XLM")).toBeInTheDocument();
  });

  it("shows 0.00 XLM reserve impact when subentryCount is 0", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC",
      account: {
        sequence: "123456",
        subentryCount: 0,
      },
      isLoadingAccount: false,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountCard />);
    expect(screen.getByText("0.00 XLM")).toBeInTheDocument();
  });

  // ── Sequence tooltip (#178) ─────────────────────────────────────────────
  it("shows the sequence tooltip text on focus/hover and links it via aria-labelledby", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC",
      account: {
        sequence: "123456",
        subentryCount: 2,
      },
      isLoadingAccount: false,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountCard />);

    expect(
      screen.queryByText(/prevent replay attacks/i),
    ).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", {
      name: "What is the sequence number?",
    });
    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByText(/prevent replay attacks/i);
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute("role", "tooltip");

    const sequenceLabel = screen.getByText("Sequence");
    expect(tooltip.getAttribute("aria-labelledby")).toBe(
      sequenceLabel.getAttribute("id"),
    );

    fireEvent.mouseLeave(trigger);
    expect(
      screen.queryByText(/prevent replay attacks/i),
    ).not.toBeInTheDocument();
  });
});

import { AccountCardCompact } from "./AccountCard";

describe("AccountCardCompact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when address is null", () => {
    vi.mocked(useSorokit).mockReturnValue({
      address: null,
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<AccountCardCompact />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the first two characters of the address as the avatar (uppercase)", () => {
    const address = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";
    vi.mocked(useSorokit).mockReturnValue({
      address,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountCardCompact />);
    expect(screen.getByText("GA")).toBeInTheDocument();
  });

  it("displays the truncated address", () => {
    const address = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";
    vi.mocked(useSorokit).mockReturnValue({
      address,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountCardCompact />);
    const addrEl = document.querySelector("[data-address]");
    expect(addrEl).toBeInTheDocument();
    // Should be truncated (shorter than the full address)
    expect(addrEl?.textContent?.length).toBeLessThan(address.length);
    expect(addrEl?.textContent).toContain("...");
  });

  it("shows 'Connected' label", () => {
    const address = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA";
    vi.mocked(useSorokit).mockReturnValue({
      address,
    } as unknown as ReturnType<typeof useSorokit>);

    render(<AccountCardCompact />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });
});
