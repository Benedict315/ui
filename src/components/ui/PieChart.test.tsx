import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PieChart, PieSlice } from "./PieChart";

describe("PieChart", () => {
  const mockSlices: PieSlice[] = [
    { key: "1", label: "Asset A", value: 30 },
    { key: "2", label: "Asset B", value: 50 },
    { key: "3", label: "Asset C", value: 20 },
  ];

  it("renders one path element per slice", () => {
    const { container } = render(<PieChart slices={mockSlices} />);
    const paths = container.querySelectorAll("svg path");
    expect(paths).toHaveLength(mockSlices.length);
  });

  it("renders centerLabel when provided", () => {
    render(<PieChart slices={mockSlices} centerLabel={<span>Center Text</span>} />);
    expect(screen.getByText("Center Text")).toBeInTheDocument();
  });

  it("shows fallback when slices array is empty", () => {
    render(<PieChart slices={[]} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("shows fallback when all slice values are zero", () => {
    const zeroSlices: PieSlice[] = [
      { key: "1", label: "Zero A", value: 0 },
      { key: "2", label: "Zero B", value: 0 },
    ];
    render(<PieChart slices={zeroSlices} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("applies hover CSS class to slice paths", () => {
    const { container } = render(<PieChart slices={mockSlices} />);
    const paths = container.querySelectorAll("svg path");
    paths.forEach((path: Element) => {
      expect(path).toHaveClass("hover:opacity-80");
    });
  });

  it("includes tooltip title elements for each slice", () => {
    const { container } = render(<PieChart slices={mockSlices} />);
    const titles = container.querySelectorAll("svg path title");
    expect(titles).toHaveLength(mockSlices.length);
  });

  it("renders legend items with correct percentages", () => {
    render(<PieChart slices={mockSlices} />);
    expect(screen.getByText(/Asset A.*30\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/Asset B.*50\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/Asset C.*20\.0%/)).toBeInTheDocument();
  });

  it("does not render legend when showLegend is false", () => {
    const { container } = render(<PieChart slices={mockSlices} showLegend={false} />);
    const legend = container.querySelector('ul[aria-label="Chart legend"]');
    expect(legend).not.toBeInTheDocument();
  });

  it("uses custom color when provided on a slice", () => {
    const slicesWithColor: PieSlice[] = [
      { key: "1", label: "Custom", value: 100, color: "#FF0000" },
    ];
    const { container } = render(<PieChart slices={slicesWithColor} />);
    const path = container.querySelector("svg path");
    expect(path).toHaveAttribute("fill", "#FF0000");
  });

  it("falls back to default palette when no color is provided", () => {
    const { container } = render(<PieChart slices={mockSlices} />);
    const paths = container.querySelectorAll("svg path");
    paths.forEach((path: Element) => {
      const fill = path.getAttribute("fill");
      expect(fill).toBeTruthy();
      expect(fill).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("renders with custom size", () => {
    const { container } = render(<PieChart slices={mockSlices} size={200} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "200");
    expect(svg).toHaveAttribute("height", "200");
  });

  it("renders with custom ariaLabel", () => {
    const { container } = render(<PieChart slices={mockSlices} ariaLabel="Custom chart" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-label", "Custom chart");
  });

  it("renders empty state with centerLabel", () => {
    render(<PieChart slices={[]} centerLabel={<span>Empty Label</span>} />);
    expect(screen.getByText("Empty Label")).toBeInTheDocument();
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
});
