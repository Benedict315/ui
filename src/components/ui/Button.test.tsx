ùimport { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect,it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders a loading spinner when loading is true", () => {
    const { container } = render(<Button loading>Submit</Button>);
expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
    // The spinner is a span with animate-spin class
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:opacity-40");
  });

  it("is disabled when loading is true", () => {
    render(<Button loading>Submit</Button>);
const button = screen.getByRole("button", { name: /Submit/i });
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

  describe("requireConfirm pattern", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("changes label to confirmLabel on first click", () => {
      const onClick = vi.fn();
      render(
        <Button requireConfirm confirmLabel="Are you sure?" onClick={onClick}>
          Delete
        </Button>
      );

      const button = screen.getByRole("button", { name: "Delete" });
      fireEvent.click(button);

      expect(screen.getByRole("button", { name: "Are you sure?" })).toBeInTheDocument();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("fires onClick on second click", () => {
      const onClick = vi.fn();
      render(
        <Button requireConfirm confirmLabel="Confirm?" onClick={onClick}>
          Delete
        </Button>
      );

      const button = screen.getByRole("button", { name: "Delete" });

      // First click
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();

      // Second click
      const confirmButton = screen.getByRole("button", { name: "Confirm?" });
      fireEvent.click(confirmButton);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("resets to original label after timeout without second click", () => {
      const onClick = vi.fn();
      render(
        <Button requireConfirm confirmLabel="Confirm?" confirmTimeout={3000} onClick={onClick}>
          Delete
        </Button>
      );

      const button = screen.getByRole("button", { name: "Delete" });

      // First click
      fireEvent.click(button);
      expect(screen.getByRole("button", { name: "Confirm?" })).toBeInTheDocument();

      // Advance time past timeout
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Label should reset back to original
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("cancels timeout if second click happens before timeout", () => {
      const onClick = vi.fn();
      render(
        <Button requireConfirm confirmLabel="Confirm?" confirmTimeout={3000} onClick={onClick}>
          Delete
        </Button>
      );

      const button = screen.getByRole("button", { name: "Delete" });

      // First click
      fireEvent.click(button);
      expect(screen.getByRole("button", { name: "Confirm?" })).toBeInTheDocument();

      // Second click before timeout
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const confirmButton = screen.getByRole("button", { name: "Confirm?" });
      fireEvent.click(confirmButton);

      expect(onClick).toHaveBeenCalledTimes(1);

      // Advance time to see if timeout would have fired (it shouldn't)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Button should show original label after reset
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });
  it("asChild buttons with disabled do not fire onClick on the child", () => {
    const childClick = vi.fn();
    render(
      <Button asChild disabled>
        <button onClick={childClick}>Click me</button>
      </Button>
    );
    const button = screen.getByRole("button", { name: "Click me" });
    button.click();
    expect(childClick).not.toHaveBeenCalled();
  });

  it("asChild buttons with disabled do not fire onClick on a non-button child", () => {
    const childClick = vi.fn();
    const { container } = render(
      <Button asChild disabled>
        <div onClick={childClick}>Click me</div>
      </Button>
    );
    const child = container.querySelector("div");
    child?.click();
    expect(childClick).not.toHaveBeenCalled();
  });
});
