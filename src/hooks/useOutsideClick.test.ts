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
});
