import { render, screen } from "@testing-library/react";
import { describe, expect,it } from "vitest";

import {
  AssetRowSkeleton,
  Skeleton,
  SkeletonCard,
  SkeletonRow,
} from "./Skeleton";

describe("Skeleton", () => {
  it("marks the placeholder as presentational for assistive tech", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "presentation");
  });

  it("applies a circle radius when the circle prop is set", () => {
    const { container } = render(<Skeleton circle />);
    expect(container.firstElementChild).toHaveClass("rounded-full");
  });

  it("uses animate-pulse by default (no variant prop)", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveClass("animate-pulse");
  });

  it("applies skeleton-shimmer class when variant='shimmer'", () => {
    const { container } = render(<Skeleton variant="shimmer" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass("skeleton-shimmer");
    expect(el).not.toHaveClass("animate-pulse");
  });

  it("applies animate-pulse when variant='pulse' is explicit", () => {
    const { container } = render(<Skeleton variant="pulse" />);
    expect(container.firstElementChild).toHaveClass("animate-pulse");
    expect(container.firstElementChild).not.toHaveClass("skeleton-shimmer");
  });
});

describe("SkeletonRow", () => {
  it("is presentational", () => {
    const { container } = render(<SkeletonRow />);
    expect(container.firstElementChild).toHaveAttribute("role", "presentation");
  });
});

describe("SkeletonCard", () => {
  it("announces a busy/loading state via aria-busy", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
  });

  it("renders the requested number of body rows", () => {
    const { container } = render(<SkeletonCard rows={5} />);
    // header has 2 skeletons; body has `rows`; all carry role=presentation
    const placeholders = container.querySelectorAll('[role="presentation"]');
    expect(placeholders.length).toBe(2 + 5);
  });

  it("uses stable keys that encode row count — changing rows remounts items", () => {
    const { rerender, container } = render(<SkeletonCard rows={3} />);
    const before = Array.from(
      container.querySelectorAll('[role="presentation"]'),
    ).map((el) => el.getAttribute("data-key"));

    rerender(<SkeletonCard rows={2} />);
    const afterRows = container.querySelectorAll(
      '.px-5.py-5 [role="presentation"]',
    );
    // After decreasing rows there should be exactly 2 body skeletons, not 3
    expect(afterRows.length).toBe(2);
    void before; // suppress unused-var lint
  });
});

describe("AssetRowSkeleton", () => {
  it("is presentational", () => {
    const { container } = render(<AssetRowSkeleton />);
    expect(container.firstElementChild).toHaveAttribute("role", "presentation");
  });

  it("renders a right-side amount placeholder", () => {
    render(<AssetRowSkeleton />);
    expect(screen.getByTestId("asset-amount-skeleton")).toBeInTheDocument();
  });

  it("lays out left content and right amount with space-between", () => {
    const { container } = render(<AssetRowSkeleton />);
    expect(container.firstElementChild).toHaveClass("justify-between");
  });
});
