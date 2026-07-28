import { fireEvent,render, screen } from "@testing-library/react";
import { describe, expect,it, vi } from "vitest";

import type { Balance } from "@/lib/client";

import { AssetBadge, AssetPill, isKnownAsset } from "./AssetBadge";

const nativeBalance: Balance = {
  assetType: "native",
  assetCode: null,
  assetIssuer: null,
  balance: "100",
  balanceFloat: 100,
};

const usdcBalance: Balance = {
  assetType: "credit_alphanum4",
  assetCode: "USDC",
  assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  balance: "50",
  balanceFloat: 50,
};

const unknownBalance: Balance = {
  assetType: "credit_alphanum12",
  assetCode: "WAVEX",
  assetIssuer: "GBBB4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA",
  balance: "10",
  balanceFloat: 10,
};

const lpSharesBalance: Balance = {
  assetType: "liquidity_pool_shares",
  assetCode: undefined,
  assetIssuer: undefined,
  balance: "25",
  balanceFloat: 25,
};

describe("AssetBadge", () => {
  it("renders 'XLM' for native asset type", () => {
    render(<AssetBadge balance={nativeBalance} />);
    expect(screen.getByText("XLM")).toBeInTheDocument();
  });

  it("renders 'Stellar Lumens' sub-label for native when showIssuer is true", () => {
    render(<AssetBadge balance={nativeBalance} showIssuer />);
    expect(screen.getByText("Stellar Lumens")).toBeInTheDocument();
  });

  it("applies teal color class for XLM", () => {
    const { container } = render(<AssetBadge balance={nativeBalance} />);
    const icon = container.querySelector(".text-teal");
    expect(icon).toBeInTheDocument();
  });

  it("renders the asset code for a known asset (USDC)", () => {
    render(<AssetBadge balance={usdcBalance} />);
    expect(screen.getByText("USDC")).toBeInTheDocument();
  });

  it("applies brand color class for USDC", () => {
    const { container } = render(<AssetBadge balance={usdcBalance} />);
    const icon = container.querySelector(".text-brand");
    expect(icon).toBeInTheDocument();
  });

  it("renders the truncated issuer when showIssuer is true", () => {
    render(<AssetBadge balance={usdcBalance} showIssuer />);
    const issuerEl = document.querySelector("[data-address]");
    expect(issuerEl).toBeInTheDocument();
    // Issuer is truncated (not the full key)
    expect(issuerEl?.textContent?.length).toBeLessThan(usdcBalance.assetIssuer!.length);
  });

  it("hides the issuer when showIssuer is false", () => {
    render(<AssetBadge balance={usdcBalance} showIssuer={false} />);
    expect(document.querySelector("[data-address]")).not.toBeInTheDocument();
  });

  it("falls back to grey/surface-2 for an unknown asset", () => {
    const { container } = render(<AssetBadge balance={unknownBalance} />);
    const icon = container.querySelector(".bg-surface-2");
    expect(icon).toBeInTheDocument();
  });

  it("renders the asset code for an unknown asset", () => {
    render(<AssetBadge balance={unknownBalance} />);
    expect(screen.getByText("WAVEX")).toBeInTheDocument();
  });

  it("renders 'LP' for liquidity_pool_shares without undefined display", () => {
    const { container } = render(<AssetBadge balance={lpSharesBalance} />);
    expect(screen.getAllByText("LP").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
    const icon = container.querySelector(".bg-surface-2.text-ink-2");
    expect(icon).toBeInTheDocument();
    expect(icon?.textContent).toBe("LP");
  });

  it("renders 'Liquidity Pool Shares' sub-label for LP when showIssuer is true", () => {
    render(<AssetBadge balance={lpSharesBalance} showIssuer />);
    expect(screen.getByText("Liquidity Pool Shares")).toBeInTheDocument();
  });

  describe("showIssuerForUnknown", () => {
    it("hides the issuer for a known asset (USDC)", () => {
      render(<AssetBadge balance={usdcBalance} showIssuerForUnknown />);
      expect(document.querySelector("[data-address]")).not.toBeInTheDocument();
    });

    it("hides the 'Stellar Lumens' sub-label for native XLM", () => {
      render(<AssetBadge balance={nativeBalance} showIssuerForUnknown />);
      expect(screen.queryByText("Stellar Lumens")).not.toBeInTheDocument();
    });

    it("shows the issuer for an unknown asset", () => {
      render(<AssetBadge balance={unknownBalance} showIssuerForUnknown />);
      expect(document.querySelector("[data-address]")).toBeInTheDocument();
    });

    it("takes precedence over showIssuer", () => {
      render(
        <AssetBadge balance={usdcBalance} showIssuer showIssuerForUnknown />,
      );
      expect(document.querySelector("[data-address]")).not.toBeInTheDocument();
    });
  });

  describe("onClick", () => {
    it("renders a button with asset-selection semantics when onClick is given", () => {
      render(<AssetBadge balance={usdcBalance} onClick={() => {}} />);
      expect(
        screen.getByRole("button", { name: "Select USDC" }),
      ).toBeInTheDocument();
    });

    it("calls onClick when clicked", () => {
      const onClick = vi.fn();
      render(<AssetBadge balance={usdcBalance} onClick={onClick} />);
      fireEvent.click(screen.getByRole("button", { name: "Select USDC" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("stays a non-interactive div without onClick", () => {
      render(<AssetBadge balance={usdcBalance} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("merges a custom className onto the interactive wrapper", () => {
      render(
        <AssetBadge balance={usdcBalance} onClick={() => {}} className="my-badge" />,
      );
      expect(screen.getByRole("button")).toHaveClass("my-badge");
    });
  });

  describe("icon character count", () => {
    it("shows 2 characters at the default size", () => {
      const { container } = render(<AssetBadge balance={unknownBalance} />);
      expect(container.querySelector(".rounded-full")?.textContent).toBe("WA");
    });

    it("shows up to 4 characters at size lg", () => {
      const { container } = render(
        <AssetBadge balance={unknownBalance} size="lg" />,
      );
      expect(container.querySelector(".rounded-full")?.textContent).toBe("WAVE");
    });

    it("does not pad short codes at size lg", () => {
      const { container } = render(
        <AssetBadge balance={nativeBalance} size="lg" />,
      );
      expect(container.querySelector(".rounded-full")?.textContent).toBe("XLM");
    });
  });
});

describe("isKnownAsset", () => {
  it("recognises the built-in registry", () => {
    for (const code of ["XLM", "USDC", "USDT", "BTC", "ETH"]) {
      expect(isKnownAsset(code)).toBe(true);
    }
  });

  it("is case-insensitive", () => {
    expect(isKnownAsset("usdc")).toBe(true);
  });

  it("returns false for an unlisted asset", () => {
    expect(isKnownAsset("WAVEX")).toBe(false);
  });
});

describe("AssetPill", () => {
  it("renders the asset code", () => {
    render(<AssetPill assetCode="XLM" />);
    expect(screen.getByText("XLM")).toBeInTheDocument();
  });

  it("applies the teal colour for XLM", () => {
    render(<AssetPill assetCode="XLM" />);
    expect(screen.getByText("XLM")).toHaveClass("text-teal");
  });

  it("applies the brand colour for USDC", () => {
    render(<AssetPill assetCode="USDC" />);
    expect(screen.getByText("USDC")).toHaveClass("text-brand");
  });

  it("falls back to grey for an unknown asset code", () => {
    render(<AssetPill assetCode="WAVEX" />);
    const pill = screen.getByText("WAVEX");
    expect(pill).toHaveClass("bg-surface-2");
    expect(pill).toHaveClass("text-ink-2");
  });

  it("merges a custom className", () => {
    render(<AssetPill assetCode="XLM" className="my-pill" />);
    expect(screen.getByText("XLM")).toHaveClass("my-pill");
  });
});
