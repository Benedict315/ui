import { render, screen } from "@testing-library/react";
import { TxRow } from "./TransactionHistory";
import type { Transaction } from "@/lib/client";

describe("TxRow component", () => {
  it("displays feePaid when provided", () => {
    const tx: Transaction = {
      hash: "hash123",
      ledger: 1000,
      createdAt: new Date().toISOString(),
      successful: true,
      operationCount: 1,
      feePaid: "100",
    } as Transaction;
    render(<TxRow tx={tx} />);
    expect(screen.getByText(/Fee paid:/i)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it("shows operationCount badge when >1 and hides when =1", () => {
    const txMany: Transaction = {
      hash: "hash456",
      ledger: 1001,
      createdAt: new Date().toISOString(),
      successful: true,
      operationCount: 3,
      feePaid: "0",
    } as Transaction;
    const { rerender } = render(<TxRow tx={txMany} />);
    expect(screen.getByText(/3 ops/)).toBeInTheDocument();

    const txOne: Transaction = {
      ...txMany,
      operationCount: 1,
    } as Transaction;
    rerender(<TxRow tx={txOne} />);
    expect(screen.queryByText(/1 ops/)).not.toBeInTheDocument();
  });
});
