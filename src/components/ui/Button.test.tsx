import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders a loading spinner when loading is true", () => {
    const { container } = render(<Button loading>Submit</Button>);
    // The spinner is a span with animate-spin class
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("keeps the label visible when loading", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:opacity-40");
  });

  it("is disabled when loading is true", () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("applies primary variant by default", () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button.className).toContain("bg-brand");
    expect(button.className).toContain("text-white");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Button</Button>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button.className).toContain("border");
    expect(button.className).toContain("border-line-2");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Button</Button>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button.className).toContain("text-ink-2");
  });

  it("applies destructive variant classes", () => {
    render(<Button variant="destructive">Button</Button>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button.className).toContain("bg-error-dim");
    expect(button.className).toContain("text-red");
  });

  it("applies sm size classes", () => {
    render(<Button size="sm">Button</Button>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button.className).toContain("h-8");
  });

  it("applies md size classes by default", () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button.className).toContain("h-9");
  });

  it("applies lg size classes", () => {
    render(<Button size="lg">Button</Button>);
    const button = screen.getByRole("button", { name: "Button" });
    expect(button.className).toContain("h-10");
  });

  it("supports rendering as a child (asChild prop)", () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link?.className).toContain("bg-brand"); // variant styles are transferred
  });

  describe("iconOnly", () => {
    it("applies square size classes when iconOnly is set", () => {
      const { container } = render(
        <Button iconOnly aria-label="Refresh">
          <svg />
        </Button>
      );
      const button = container.querySelector("button")!;
      // md iconOnly: w-9 h-9
      expect(button.className).toContain("w-9");
      expect(button.className).toContain("h-9");
    });

    it("does not apply horizontal padding when iconOnly is set", () => {
      const { container } = render(
        <Button iconOnly aria-label="Refresh">
          <svg />
        </Button>
      );
      const button = container.querySelector("button")!;
      expect(button.className).not.toContain("px-");
    });

    it("applies the correct square size for sm iconOnly", () => {
      const { container } = render(
        <Button iconOnly size="sm" aria-label="Close">
          <svg />
        </Button>
      );
      const button = container.querySelector("button")!;
      expect(button.className).toContain("h-8");
      expect(button.className).toContain("w-8");
    });

    it("applies the correct square size for lg iconOnly", () => {
      const { container } = render(
        <Button iconOnly size="lg" aria-label="Expand">
          <svg />
        </Button>
      );
      const button = container.querySelector("button")!;
      expect(button.className).toContain("h-10");
      expect(button.className).toContain("w-10");
    });
  });

  describe("requireConfirm", () => {
    it("does not fire onClick on the first click", () => {
      const handleClick = vi.fn();
      render(
        <Button requireConfirm onClick={handleClick}>
          Delete
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("shows confirmLabel after the first click", () => {
      render(
        <Button requireConfirm confirmLabel="Confirm delete?">
          Delete
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("Confirm delete?")).toBeInTheDocument();
    });

    it("uses the default confirmLabel when none is provided", () => {
      render(<Button requireConfirm>Delete</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("fires onClick on the second click", () => {
      const handleClick = vi.fn();
      render(
        <Button requireConfirm onClick={handleClick}>
          Delete
        </Button>
      );
      const button = screen.getByRole("button");
      fireEvent.click(button); // first click — pending confirm
      fireEvent.click(button); // second click — confirm
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("resets confirmation state on blur", () => {
      render(
        <Button requireConfirm confirmLabel="Confirm?">
          Delete
        </Button>
      );
      const button = screen.getByRole("button");
      fireEvent.click(button);
      expect(screen.getByText("Confirm?")).toBeInTheDocument();
      fireEvent.blur(button);
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });
});
