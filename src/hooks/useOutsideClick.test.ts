import { fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useOutsideClick } from "./useOutsideClick";

describe("useOutsideClick", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("fires the callback when clicking outside the referenced element", () => {
    const handler = vi.fn();
    const insideNode = document.createElement("div");
    const outsideNode = document.createElement("div");
    document.body.appendChild(insideNode);
    document.body.appendChild(outsideNode);

    renderHook(() => {
      const ref = useOutsideClick<HTMLDivElement>(handler);
      ref.current = insideNode;
      return ref;
    });

    fireEvent.mouseDown(outsideNode);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire the callback when clicking inside the referenced element", () => {
    const handler = vi.fn();
    const insideNode = document.createElement("div");
    const childNode = document.createElement("button");
    insideNode.appendChild(childNode);
    document.body.appendChild(insideNode);

    renderHook(() => {
      const ref = useOutsideClick<HTMLDivElement>(handler);
      ref.current = insideNode;
      return ref;
    });

    fireEvent.mouseDown(insideNode);
    fireEvent.mouseDown(childNode);
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not fire the callback when enabled is false", () => {
    const handler = vi.fn();
    const insideNode = document.createElement("div");
    const outsideNode = document.createElement("div");
    document.body.appendChild(insideNode);
    document.body.appendChild(outsideNode);

    renderHook(() => {
      const ref = useOutsideClick<HTMLDivElement>(handler, false);
      ref.current = insideNode;
      return ref;
    });

    fireEvent.mouseDown(outsideNode);
    fireEvent.pointerDown(outsideNode);
    fireEvent.touchStart(outsideNode);
    expect(handler).not.toHaveBeenCalled();
  });

  it("removes event listeners on unmount", () => {
    const handler = vi.fn();
    const insideNode = document.createElement("div");
    const outsideNode = document.createElement("div");
    document.body.appendChild(insideNode);
    document.body.appendChild(outsideNode);

    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => {
      const ref = useOutsideClick<HTMLDivElement>(handler);
      ref.current = insideNode;
      return ref;
    });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));

    fireEvent.mouseDown(outsideNode);
    expect(handler).not.toHaveBeenCalled();
  });

  it("removes event listeners when enabled toggles to false", () => {
    const handler = vi.fn();
    const insideNode = document.createElement("div");
    const outsideNode = document.createElement("div");
    document.body.appendChild(insideNode);
    document.body.appendChild(outsideNode);

    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { rerender } = renderHook(({ enabled }) => {
      const ref = useOutsideClick<HTMLDivElement>(handler, enabled);
      ref.current = insideNode;
      return ref;
    }, { initialProps: { enabled: true } });

    // Verify listeners are attached when enabled is true
    fireEvent.mouseDown(outsideNode);
    expect(handler).toHaveBeenCalledTimes(1);

    // Toggle enabled to false
    rerender({ enabled: false });

    // Verify cleanup was called
    expect(removeSpy).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));

    // Verify handler is not called after disabled
    handler.mockClear();
    fireEvent.mouseDown(outsideNode);
    fireEvent.pointerDown(outsideNode);
    fireEvent.touchStart(outsideNode);
    expect(handler).not.toHaveBeenCalled();
  });

  it("reattaches event listeners when enabled toggles back to true", () => {
    const handler = vi.fn();
    const insideNode = document.createElement("div");
    const outsideNode = document.createElement("div");
    document.body.appendChild(insideNode);
    document.body.appendChild(outsideNode);

    const addSpy = vi.spyOn(document, "addEventListener");

    const { rerender } = renderHook(({ enabled }) => {
      const ref = useOutsideClick<HTMLDivElement>(handler, enabled);
      ref.current = insideNode;
      return ref;
    }, { initialProps: { enabled: true } });

    // Initial state: enabled
    const initialAddCount = addSpy.mock.calls.length;

    // Toggle to false
    rerender({ enabled: false });

    // Handler should not fire
    handler.mockClear();
    fireEvent.mouseDown(outsideNode);
    expect(handler).not.toHaveBeenCalled();

    // Toggle back to true
    rerender({ enabled: true });

    // Verify listeners were re-attached
    expect(addSpy.mock.calls.length).toBeGreaterThan(initialAddCount);

    // Handler should fire again
    fireEvent.mouseDown(outsideNode);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
