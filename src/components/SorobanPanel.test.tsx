import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SorobanPanel } from "./SorobanPanel";
import { useSorokit } from "@/context/useSorokit";

// Mock the useSorokit context
vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

// Mock the getClient from lib/client
vi.mock("../lib/client", () => ({
  getClient: () => ({
    soroban: {
      invokeContract: vi.fn().mockResolvedValue({ data: "Success", error: null }),
    },
  }),
}));

describe("SorobanPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSorokit).mockReturnValue({
      isConnected: true,
      address: "GABC",
    } as any);
  });

  it("should have invoke button disabled when method is empty", () => {
    render(<SorobanPanel contractId="" onContractIdChange={() => {}} />);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });
    expect(invokeBtn).toBeDisabled();
  });

  it("should show error when invalid JSON args are provided", async () => {
    let currentContractId = "";
    const setContractId = (id: string) => {
      currentContractId = id;
    };

    const { rerender } = render(
      <SorobanPanel contractId={currentContractId} onContractIdChange={setContractId} />
    );
    
    // Fill out contract ID and method to enable the button
    const contractInput = screen.getByPlaceholderText(/c\.\.\./i);
    const methodInput = screen.getByPlaceholderText(/transfer/i);
    const argsInput = screen.getByPlaceholderText(/\[.*\]/i);
    const invokeBtn = screen.getByRole("button", { name: /invoke/i });

    fireEvent.change(contractInput, { target: { value: "C123" } });
    fireEvent.change(methodInput, { target: { value: "mint" } });
    fireEvent.change(argsInput, { target: { value: "invalid json {" } });

    // Rerender with the updated contract ID to propagate prop change
    rerender(<SorobanPanel contractId="C123" onContractIdChange={setContractId} />);

    expect(invokeBtn).not.toBeDisabled();
    
    fireEvent.click(invokeBtn);

    // Expect the error state to be set
    const errorText = await screen.findByText(/Invalid JSON in arguments/i);
    expect(errorText).toBeInTheDocument();
  });
});
