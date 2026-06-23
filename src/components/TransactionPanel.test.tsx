import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionPanel } from "./TransactionPanel";
import { getClient } from "@/lib/client";
import { useSorokit } from "@/context/useSorokit";

vi.mock("@/context/useSorokit", () => ({
  useSorokit: vi.fn(),
}));

vi.mock("@/lib/client", () => ({
  getClient: vi.fn(),
}));

describe("TransactionPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSorokit).mockReturnValue({
      address: "GABC",
      isConnected: true,
    } as unknown as ReturnType<typeof useSorokit>);
  });

  it("handles loading, success, and error states", async () => {
    const mockSubmit = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ data: { hash: "txhash123", ledger: 100 }, error: null }), 50);
      });
    });

    vi.mocked(getClient).mockReturnValue({
      transaction: {
        submit: mockSubmit,
      },
    } as unknown as ReturnType<typeof getClient>);

    render(<TransactionPanel />);

    const destInput = screen.getByLabelText("Destination Address");
    const amountInput = screen.getByLabelText("Amount (XLM)");
    const submitBtn = screen.getByRole("button", { name: "Send Payment" });

    const validDest = "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";
    fireEvent.change(destInput, { target: { value: validDest } });
    fireEvent.change(amountInput, { target: { value: "10" } });

    // Submit and check loading state
    fireEvent.click(submitBtn);
    expect(submitBtn).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submitting…" })).toBeInTheDocument();

    // Check success state
    expect(await screen.findByText("Transaction submitted")).toBeInTheDocument();
    expect(screen.getByText("Ledger #100")).toBeInTheDocument();
    expect(screen.getByText("txhash123")).toBeInTheDocument();

    // Test "New Transaction" button resets state
    const newTxBtn = screen.getByRole("button", { name: "New Transaction" });
    fireEvent.click(newTxBtn);

    expect(screen.getByLabelText("Destination Address")).toHaveValue("");
    expect(screen.getByLabelText("Amount (XLM)")).toHaveValue(null);
  });

  it("handles error state", async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ data: null, error: "Insufficient balance" });

    vi.mocked(getClient).mockReturnValue({
      transaction: {
        submit: mockSubmit,
      },
    } as unknown as ReturnType<typeof getClient>);

    render(<TransactionPanel />);

    const validDest = "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";
    fireEvent.change(screen.getByLabelText("Destination Address"), { target: { value: validDest } });
    fireEvent.change(screen.getByLabelText("Amount (XLM)"), { target: { value: "10" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Send Payment" }));

    expect(await screen.findByText("Transaction failed")).toBeInTheDocument();
    expect(screen.getByText("Insufficient balance")).toBeInTheDocument();
  });

  it("shows validation error for invalid destination address", async () => {
    render(<TransactionPanel />);

    const destInput = screen.getByLabelText("Destination Address");
    const amountInput = screen.getByLabelText("Amount (XLM)");
    const submitBtn = screen.getByRole("button", { name: "Send Payment" });

    // Initially no error should be visible
    expect(screen.queryByText("Invalid Stellar address")).not.toBeInTheDocument();

    // Type invalid address
    fireEvent.change(destInput, { target: { value: "GDEF" } });
    fireEvent.change(amountInput, { target: { value: "10" } });

    // Validation error should show up because field is dirty and invalid
    expect(screen.getByText("Invalid Stellar address")).toBeInTheDocument();
    // Submit button should be disabled because canSubmit is false
    expect(submitBtn).toBeDisabled();

    // Type valid address
    const validDest = "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";
    fireEvent.change(destInput, { target: { value: validDest } });
    expect(screen.queryByText("Invalid Stellar address")).not.toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
  });

  it("shows error if address is null at submit time", async () => {
    (useSorokit as any).mockReturnValue({
      address: null,
      isConnected: true,
    });

    render(<TransactionPanel />);

    const destInput = screen.getByLabelText("Destination Address");
    const amountInput = screen.getByLabelText("Amount (XLM)");
    const submitBtn = screen.getByRole("button", { name: "Send Payment" });

    const validDest = "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";
    fireEvent.change(destInput, { target: { value: validDest } });
    fireEvent.change(amountInput, { target: { value: "10" } });

    fireEvent.click(submitBtn);

    expect(await screen.findByText("Transaction failed")).toBeInTheDocument();
    expect(screen.getByText("Wallet not connected")).toBeInTheDocument();
  });
});
