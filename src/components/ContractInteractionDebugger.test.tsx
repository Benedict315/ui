import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractInteractionDebugger } from "./ContractInteractionDebugger";

describe("ContractInteractionDebugger", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("toggles the debugger panel and shows the prepared call details", () => {
    render(
      <ContractInteractionDebugger
        contractId="C123"
        method="transfer"
        args={["GABC", "2"]}
        state="success"
        result={{ ok: true }}
        error={null}
      />,
    );

    expect(screen.getByRole("button", { name: /show debugger/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show debugger/i }));

    expect(screen.getByText(/prepared contract call/i)).toBeInTheDocument();
    expect(screen.getByText(/simulation result/i)).toBeInTheDocument();
    expect(screen.getByText(/submission attempts/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hide debugger/i }));

    expect(screen.queryByText(/prepared contract call/i)).not.toBeInTheDocument();
  });

  it("copies values and stores recent invocations in session storage", async () => {
    render(
      <ContractInteractionDebugger
        contractId="C123"
        method="balance"
        args={["GA123"]}
        state="success"
        result={{ txHash: "abc123", status: "submitted" }}
        txHash="abc123"
        error={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show debugger/i }));

    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    fireEvent.click(copyButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("C123"));

    const stored = window.sessionStorage.getItem("sorokit-soroban-debug-history");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? "[]");
    expect(parsed).toHaveLength(1);
    expect(parsed[0].contractId).toBe("C123");
  });
});
