import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Skeleton,
  SkeletonRow,
  SkeletonCard,
  AssetRowSkeleton,
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

  it("applies rounded-none when shape='square'", () => {
    const { container } = render(<Skeleton shape="square" />);
    expect(container.firstElementChild).toHaveClass("rounded-none");
  });

  it("applies rounded-full when shape='circle'", () => {
    const { container } = render(<Skeleton shape="circle" />);
    expect(container.firstElementChild).toHaveClass("rounded-full");
  });

  it("applies rounded-lg when shape='rounded' or default", () => {
    const { container: c1 } = render(<Skeleton shape="rounded" />);
    expect(c1.firstElementChild).toHaveClass("rounded-lg");

    const { container: c2 } = render(<Skeleton />);
    expect(c2.firstElementChild).toHaveClass("rounded-lg");
  });
});

describe("SkeletonRow", () => {
  it("is presentational", () => {
    const { container } = render(<SkeletonRow />);
    expect(container.firstElementChild).toHaveAttribute("role", "presentation");
  });

  it("renders multiple rows when count prop is provided", () => {
    const { container } = render(<SkeletonRow count={5} />);
    const rows = container.querySelectorAll('[role="presentation"]');
    // Each SkeletonRow contains 1 wrapper div + 3 internal Skeletons = 4 presentational divs per row
    // Or querying top-level children / row divs:
    expect(container.children.length).toBe(5);
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

  it("renders custom header slot when header prop is provided", () => {
    const customHeader = (
      <div data-testid="custom-card-header" className="px-5 py-4 border-b border-line flex items-center justify-between">
        <Skeleton shape="circle" className="w-8 h-8" />
        <Skeleton shape="rounded" className="h-4 w-24" />
      </div>
    );
    render(<SkeletonCard header={customHeader} />);
    expect(screen.getByTestId("custom-card-header")).toBeInTheDocument();
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
