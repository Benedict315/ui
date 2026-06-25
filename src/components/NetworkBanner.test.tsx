import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NetworkBanner } from "./NetworkBanner";
import { useSorokit } from "@/context/useSorokit";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

function mockNetwork(name: string) {
  vi.mocked(useSorokit).mockReturnValue({
    network: { name },
  } as unknown as ReturnType<typeof useSorokit>);
}

describe("NetworkBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when network is null", () => {
    vi.mocked(useSorokit).mockReturnValue({
      network: null,
    } as unknown as ReturnType<typeof useSorokit>);

    const { container } = render(<NetworkBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is hidden on mainnet by default (alwaysShow = false)", () => {
    mockNetwork("mainnet");
    const { container } = render(<NetworkBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows on mainnet when alwaysShow is true", () => {
    mockNetwork("mainnet");
    render(<NetworkBanner alwaysShow />);
    expect(screen.getByText(/mainnet/i)).toBeInTheDocument();
  });

  it("renders the testnet banner by default", () => {
    mockNetwork("testnet");
    render(<NetworkBanner />);
    expect(screen.getByText(/testnet/i)).toBeInTheDocument();
    expect(screen.getByText(/test funds only/i)).toBeInTheDocument();
  });

  it("applies orange styling for testnet", () => {
    mockNetwork("testnet");
    const { container } = render(<NetworkBanner />);
    // The dot span should carry the testnet orange class
    const dot = container.querySelector(".bg-orange");
    expect(dot).toBeInTheDocument();
  });

  it("renders the futurenet banner by default", () => {
    mockNetwork("futurenet");
    render(<NetworkBanner />);
    expect(screen.getByText(/futurenet/i)).toBeInTheDocument();
  });

  it("applies purple styling for futurenet", () => {
    mockNetwork("futurenet");
    const { container } = render(<NetworkBanner />);
    const dot = container.querySelector(".bg-purple");
    expect(dot).toBeInTheDocument();
  });

  it("renders the localnet banner by default", () => {
    mockNetwork("localnet");
    render(<NetworkBanner />);
    expect(screen.getByText(/localnet/i)).toBeInTheDocument();
  });

  it("accepts a custom className", () => {
    mockNetwork("testnet");
    const { container } = render(<NetworkBanner className="my-class" />);
    const banner = container.firstElementChild;
    expect(banner?.classList.contains("my-class")).toBe(true);
  });
});
